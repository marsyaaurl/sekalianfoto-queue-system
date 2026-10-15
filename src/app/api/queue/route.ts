import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, QueueStatus } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { getJakartaBusinessDate } from "@/lib/date";

const registQueueSchema = z.object({
    custName: z.string().trim().min(3, "Name must be at least 3 characters long"),
    phoneNumber: z.string().trim().optional(),
    idBooth: z.string().min(1, "Booth ID is required").optional(),
});

const getAllQueue = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    idBooth: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format").optional(),
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
                        id: booth.id,
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

export async function GET(req: NextRequest) {
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

        const { searchParams } = new URL(req.url);

        const validation = getAllQueue.safeParse({
            page: searchParams.get("page") || undefined,
            limit: searchParams.get("limit") || undefined,
            search: searchParams.get("search") || undefined,
            idBooth: searchParams.get("idBooth") || undefined,
            date: searchParams.get("date") || undefined,
        })

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid request.",
                        details: validation.error.flatten(),
                    },
                },
                { status: 400 }
            );
        }

        const {
            page,
            limit,
            search,
            idBooth,
            date
        } = validation.data;

        const businessDate = date
            ? new Date(`${date}T00:00:00.000Z`)
            : getJakartaBusinessDate();
        const where = {
            date: businessDate,
            ...(idBooth ? { idBooth } : {}),
            ...(search
                ? {
                    custName: {
                        contains: search,
                        mode: "insensitive" as const,
                    },
                }
                : {}),
        };

        const [queues, total] = await Promise.all([
            prisma.queue.findMany({
                where,
                select: {
                    id: true,
                    custName: true,
                    phoneNumber: true,
                    date: true,
                    queueNumber: true,
                    queueStatus: true,
                    estimatedEndAt: true,
                    createdAt: true,
                    booth: {
                        select: {
                            id: true,
                            name: true,
                            branch: true,
                        },
                    },
                },
                orderBy: [
                    { queueNumber: "asc" },
                    { createdAt: "asc" },
                ],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.queue.count({ where }),
        ]);

        return NextResponse.json(
            {
                message: "Queue data successfully retrieved.",
                data: queues,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
                date: businessDate.toISOString().slice(0, 10),
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Unexpected error on getting all queues.", err)

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
