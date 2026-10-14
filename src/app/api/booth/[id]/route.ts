import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";

const updateBoothSchema = z.object({
    name: z.string().trim().min(5, "Booth name must be at least 5 characters."),
    branch: z.string().trim().min(5, "Branch name must be at least 5 characters."),
});

export async function PATCH(
    req: NextRequest,
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

        const booth = await prisma.booth.findUnique({
            where: {
                id: id,
            }
        })

        if (!booth) {
            return NextResponse.json(
                { message: "Booth not found." },
                { status: 404 }
            )
        }

        const body = await req.json().catch(() => ({}))
        const validation = updateBoothSchema.safeParse(body);

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

        const updatedBooth = await prisma.booth.update({
            where: { id },
            data: { name, branch },
        });

        return NextResponse.json(
            {
                message: "Booth updated successfully.",
                data: updatedBooth,
            },
            { status: 200 }
        );

    } catch (err) {
        console.error("Unexpected error on editing booth data.")

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
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

        const booth = await prisma.booth.findUnique({
            where: {
                id: id,
            }
        })

        if (!booth) {
            return NextResponse.json(
                { message: "Booth not found." },
                { status: 404 }
            )
        }

        await prisma.booth.delete({
            where: {
                id: id,
            }
        })

        return NextResponse.json(
            { message: "Booth successfully deleted." },
            { status: 200 }
        )
    } catch (err) {
        console.error("Unexpected error on deleting booth.")

        return NextResponse.json(
            { message: "Internal server error." },
            { status: 500 }
        )
    }
}