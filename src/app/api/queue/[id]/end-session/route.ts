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
                        message: "Admin access required."
                    }
                },
                { status: 401 }
            )
        }

        const { id } = await params;

        const queue = await prisma.queue.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                idBooth: true,
                date: true,
                queueNumber: true,
                queueStatus: true,
            }
        })

        if (!queue) {
            return NextResponse.json(
                { message: "Queue not found." },
                { status: 404 }
            )
        }

        const currentQueue = await prisma.queue.findFirst({
            where: {
                idBooth: queue.idBooth,
                date: queue.date,
                queueStatus: {
                    in: [
                        QueueStatus.IN_TURN,
                        QueueStatus.EXTENDED,
                    ],
                },
            },
            orderBy: { queueNumber: "asc" },
            select: { id: true },
        });

        if (currentQueue?.id !== queue.id) {
            return NextResponse.json(
                {
                    error: {
                        code: "INVALID_QUEUE_STATE",
                        message: "Only the current queue can end its session.",
                    },
                },
                { status: 400 }
            );
        }

        const nextQueue = await prisma.$transaction(async (tx) => {
            const endedQueue = await tx.queue.updateMany({
                where: {
                    id: queue.id,
                    queueStatus: {
                        in: [
                            QueueStatus.IN_TURN,
                            QueueStatus.EXTENDED,
                        ],
                    },
                },
                data: {
                    queueStatus: QueueStatus.DONE,
                },
            });

            if (endedQueue.count !== 1) {
                throw new Error("Queue session was already ended.");
            }

            const next = await tx.queue.findFirst({
                where: {
                    idBooth: queue.idBooth,
                    date: queue.date,
                    queueStatus: QueueStatus.WAITING,
                },
                orderBy: { queueNumber: "asc" },
                select: {
                    id: true,
                    publicToken: true,
                    queueNumber: true,
                },
            });

            if (!next) return null;

            const estimatedEndAt = new Date(
                Date.now() + SESSION_DURATION_MINUTES * 60 * 1000
            );

            await tx.queue.update({
                where: { id: next.id },
                data: {
                    queueStatus: QueueStatus.IN_TURN,
                    estimatedEndAt,
                },
            });

            return { ...next, estimatedEndAt };
        });

        return NextResponse.json(
            {
                message: "Queue session has been ended.",
                data: {
                    nextQueue,
                },
            },
            { status: 200 }
        )
    } catch (err) {
        console.error("Unexpected error on ending queue session: ", err)

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        )
    }
}
