import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, QueueStatus } from "@/lib/prisma";
import { getJakartaBusinessDate } from "@/lib/date";

const registQueueSchema = z.object({
    custName: z.string().trim().min(3, "Name must be at least 3 characters long"),
    phoneNumber: z.string().trim().optional(),
    idBooth: z.string().min(1, "Booth ID is required").optional(),
});

const DEFAULT_SESSION_DURATION_MINUTES = 5;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const queryBoothId = req.nextUrl.searchParams.get("idBooth");

        const validation = registQueueSchema.safeParse(body);

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

        const idBooth = queryBoothId || validation.data.idBooth;

        if (!idBooth) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Booth ID is required (pass in search params or body).",
                    },
                },
                { status: 400 }
            );
        }

        const booth = await prisma.booth.findUnique({
            where: { id: idBooth },
        });

        if (!booth) {
            return NextResponse.json(
                {
                    error: {
                        code: "NOT_FOUND",
                        message: "Booth not found.",
                    },
                },
                { status: 404 }
            );
        }

        const now = new Date();
        const today = getJakartaBusinessDate(now);
        const estimatedEndAt = new Date(
            now.getTime() + DEFAULT_SESSION_DURATION_MINUTES * 60 * 1000
        );

        // Concurrency-safe queue number calculation with retry for unique constraint
        let newQueue = null;
        const maxRetries = 3;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const lastQueue = await prisma.queue.findFirst({
                    where: {
                        idBooth,
                        date: today,
                    },
                    orderBy: {
                        queueNumber: "desc",
                    },
                    select: {
                        queueNumber: true,
                    },
                });

                const nextQueueNumber = (lastQueue?.queueNumber ?? 0) + 1;

                newQueue = await prisma.queue.create({
                    data: {
                        custName: validation.data.custName,
                        phoneNumber: validation.data.phoneNumber || null,
                        date: today,
                        queueNumber: nextQueueNumber,
                        queueStatus: QueueStatus.WAITING,
                        idBooth,
                        estimatedEndAt,
                    },
                });

                break;
            } catch (err: unknown) {
                // Unique constraint conflict (P2002) on (idBooth, date, queueNumber)
                if (
                    attempt < maxRetries - 1 &&
                    typeof err === "object" &&
                    err !== null &&
                    "code" in err &&
                    err.code === "P2002"
                ) {
                    continue;
                }
                throw err;
            }
        }

        if (!newQueue) {
            throw new Error("Failed to assign queue number after multiple retries.");
        }

        // Return public-safe payload (publicToken, no internal ID or phone number)
        return NextResponse.json(
            {
                message: "Queue created successfully.",
                data: {
                    publicToken: newQueue.publicToken,
                    queueNumber: newQueue.queueNumber,
                    custName: newQueue.custName,
                    queueStatus: newQueue.queueStatus,
                    date: newQueue.date,
                    estimatedEndAt: newQueue.estimatedEndAt,
                    booth: {
                        name: booth.name,
                        branch: booth.branch,
                    }
                },
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Unexpected error on queue registration:", err);
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