import { NextRequest, NextResponse } from "next/server";
import { prisma, QueueStatus } from "@/lib/prisma";

const SESSION_DURATION_MINUTES = 5;
const ACTIVE_QUEUE_STATUSES = [
    QueueStatus.WAITING,
    QueueStatus.IN_TURN,
    QueueStatus.EXTENDED,
];

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const queue = await prisma.queue.findUnique({
            where: {
                publicToken: id
            },
            select: {
                queueNumber: true,
                custName: true,
                queueStatus: true,
                estimatedEndAt: true,
                date: true,
                idBooth: true,
                booth: {
                    select: {
                        name: true,
                        branch: true
                    }
                }
            }
        });

        if (!queue) {
            return NextResponse.json(
                { message: "Queue not found." },
                { status: 404 }
            )
        }

        const queuesAhead = await prisma.queue.findMany({
            where: {
                idBooth: queue.idBooth,
                date: queue.date,
                queueNumber: { lt: queue.queueNumber },
                queueStatus: { in: ACTIVE_QUEUE_STATUSES },
            },
            select: {
                queueStatus: true,
            },
        });

        const peopleAhead = queuesAhead.length;
        const estimatedWaitMinutes = queuesAhead.reduce(
            (totalMinutes, queueAhead) =>
                totalMinutes +
                SESSION_DURATION_MINUTES +
                (queueAhead.queueStatus === QueueStatus.EXTENDED
                    ? SESSION_DURATION_MINUTES
                    : 0),
            0
        );

        return NextResponse.json(
            {
                message: "Queue data successfully retrieved.",
                data: {
                    ...queue,
                    peopleAhead,
                    estimatedWaitMinutes,
                },
            },
            { status: 200 }
        )
    } catch {
        console.error("Unexpected error on getting queue.")

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        )
    }
}
