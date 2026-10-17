import { NextRequest, NextResponse } from "next/server";
import { prisma, QueueStatus } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

const SESSION_EXTENSION_MINUTES = 5;

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
                estimatedEndAt: true,
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
                        message: "Only the current queue can extend its session.",
                    },
                },
                { status: 400 }
            );
        }

        const now = new Date();
        const extensionBase =
            queue.estimatedEndAt && queue.estimatedEndAt > now
                ? queue.estimatedEndAt
                : now;
        const estimatedEndAt = new Date(
            extensionBase.getTime() + SESSION_EXTENSION_MINUTES * 60 * 1000
        );

        const extendedQueue = await prisma.queue.updateMany({
            where: {
                id: queue.id,
                queueStatus: {
                    in: [QueueStatus.IN_TURN, QueueStatus.EXTENDED],
                },
            },
            data: {
                queueStatus: QueueStatus.EXTENDED,
                estimatedEndAt,
            },
        });

        if (extendedQueue.count !== 1) {
            return NextResponse.json(
                {
                    error: {
                        code: "INVALID_QUEUE_STATE",
                        message: "Queue session was already updated.",
                    },
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                message: "Queue session has been extended by 5 minutes.",
                data: {
                    id: queue.id,
                    queueStatus: QueueStatus.EXTENDED,
                    estimatedEndAt,
                },
            },
            { status: 200 }
        );

    } catch (err) {
        console.error("Unexpected error on extending queue session: ", err)

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        )
    }
}
