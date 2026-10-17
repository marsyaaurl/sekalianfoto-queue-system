import { NextRequest, NextResponse } from "next/server";
import { prisma, QueueStatus } from "@/lib/prisma";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { getJakartaBusinessDate } from "@/lib/date";

const createBoothSchema = z.object({
    name: z.string().trim().min(5, "Booth name must be at least 5 characters."),
    branch: z.string().trim().min(5, "Branch name must be at least 5 characters."),
});

export async function POST(req: NextRequest) {
    try {
        // 1. RBAC Check (Admin session required)
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json(
                {
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Admin access required.",
                    },
                },
                { status: 401 }
            );
        }

        // 2. Validate input body
        const body = await req.json().catch(() => ({}));
        const validation = createBoothSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid inputs.",
                        details: validation.error.flatten(),
                    },
                },
                { status: 400 }
            );
        }

        const { name, branch } = validation.data;

        // 3. Create the booth to get its unique ID
        const booth = await prisma.booth.create({
            data: {
                name,
                branch,
            },
        });

        // 4. Generate GoQR URL pointing to the queue form for this booth.
        const origin = req.nextUrl.origin; // e.g. "http://localhost:3000"
        const targetUrl = `${origin}/queue?idBooth=${encodeURIComponent(booth.id)}`;
        const qrFilePath = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

        // 5. Save the generated QR URL into the booth record
        const updatedBooth = await prisma.booth.update({
            where: { id: booth.id },
            data: { qrFilePath },
        });

        // 6. Return 201 Created response
        return NextResponse.json(
            {
                message: "Booth created successfully.",
                data: {
                    ...updatedBooth,
                    activeQueueCount: 0,
                },
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Unexpected error on creating new booth:", err);
        return NextResponse.json(
            {
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Internal server error.",
                },
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getAdminSession()

        if (!session) {
            return NextResponse.json(
                {
                    error: {
                        code: "UNAUTHORIZED",
                        message: "Admin access required."
                    }
                },
                { status: 401 }
            )
        }

        const businessDate = getJakartaBusinessDate()
        const [booths, queueCounts] = await Promise.all([
            prisma.booth.findMany({
                select: {
                    id: true,
                    name: true,
                    branch: true,
                    qrFilePath: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "desc"
                }
            }),
            prisma.queue.groupBy({
                by: ["idBooth"],
                where: {
                    date: businessDate,
                    queueStatus: {
                        in: [
                            QueueStatus.WAITING,
                            QueueStatus.IN_TURN,
                            QueueStatus.EXTENDED,
                        ],
                    },
                },
                _count: {
                    _all: true,
                },
            }),
        ])

        const queueCountByBooth = new Map(
            queueCounts.map(({ idBooth, _count }) => [idBooth, _count._all]),
        )
        const boothsWithCounts = booths.map((booth) => ({
            ...booth,
            activeQueueCount: queueCountByBooth.get(booth.id) ?? 0,
        }))

        return NextResponse.json(
            {
                message: "Booths data successfully retrieved.",
                data: boothsWithCounts,
            },
            { status: 200 }
        )
    } catch (err) {
        console.error("Unexpected error on getting all booths.")

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        )
    }
}
