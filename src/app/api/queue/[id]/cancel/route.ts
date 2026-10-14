import { NextRequest, NextResponse } from "next/server";
import { prisma, QueueStatus } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const queue = await prisma.queue.findUnique({
            where: {
                publicToken: id,
            },
            select: {
                queueStatus: true,
            }
        })

        if (!queue) {
            return NextResponse.json(
                { message: "Queue not found." },
                { status: 404 }
            )
        }

        if (queue.queueStatus !== QueueStatus.WAITING) {
            return NextResponse.json(
                { message: "Queue can not be canceled." },
                { status: 400 }
            )
        }

        await prisma.queue.update({
            where: {
                publicToken: id,
            },
            data: {
                queueStatus: QueueStatus.CANCELED,
            }
        })

        return NextResponse.json(
            { message: "Queue successfully canceled." },
            { status: 200 }
        )
    } catch (err) {
        console.error("Unexpected error on canceling queue.", err)

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        )
    }
}