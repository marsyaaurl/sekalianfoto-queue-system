import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
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

        return NextResponse.json(
            { message: "Queue data successfully retrieved.", data: queue },
            { status: 200 }
        )
    } catch (err) {
        console.error("Unexpected error on getting queue.")

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        )
    }
}