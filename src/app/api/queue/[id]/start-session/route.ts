import { NextRequest, NextResponse } from "next/server";
import { prisma, QueueStatus } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const SESSION_DURATION_MINUTES = 5;

export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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

        const { id } = await params;
        const queue = await prisma.queue.findUnique({
            where: { id },
            select: {
                id: true,
                idBooth: true,
                date: true,
                queueNumber: true,
                queueStatus: true,
            },
        });

        if (!queue) {
            return NextResponse.json(
                {
                    error: {
                        code: "NOT_FOUND",
                        message: "Queue not found.",
                    },
                },
                { status: 404 }
            );
        }

        const [activeQueue, firstWaitingQueue] = await Promise.all([
            prisma.queue.findFirst({
                where: {
                    idBooth: queue.idBooth,
                    date: queue.date,
                    queueStatus: {
                        in: [QueueStatus.IN_TURN, QueueStatus.EXTENDED],
                    },
                },
                select: { id: true },
            }),
            prisma.queue.findFirst({
                where: {
                    idBooth: queue.idBooth,
                    date: queue.date,
                    queueStatus: QueueStatus.WAITING,
                },
                orderBy: { queueNumber: "asc" },
                select: { id: true },
            }),
        ]);

        if (activeQueue) {
            return NextResponse.json(
                {
                    error: {
                        code: "INVALID_QUEUE_STATE",
                        message: "A queue session is already in progress.",
                    },
                },
                { status: 409 }
            );
        }

        if (firstWaitingQueue?.id !== queue.id) {
            return NextResponse.json(
                {
                    error: {
                        code: "INVALID_QUEUE_STATE",
                        message: "Only the first waiting queue can start a session.",
                    },
                },
                { status: 400 }
            );
        }

        const estimatedEndAt = new Date(
            Date.now() + SESSION_DURATION_MINUTES * 60 * 1000
        );
        const startedQueue = await prisma.queue.updateMany({
            where: {
                id: queue.id,
                queueStatus: QueueStatus.WAITING,
            },
            data: {
                queueStatus: QueueStatus.IN_TURN,
                estimatedEndAt,
            },
        });

        if (startedQueue.count !== 1) {
            return NextResponse.json(
                {
                    error: {
                        code: "INVALID_QUEUE_STATE",
                        message: "Queue status changed before the session could start.",
                    },
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                message: "Queue session has started.",
                data: {
                    id: queue.id,
                    queueStatus: QueueStatus.IN_TURN,
                    estimatedEndAt,
                },
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Unexpected error on starting queue session:", err);
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
