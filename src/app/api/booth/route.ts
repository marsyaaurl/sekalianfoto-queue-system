import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";

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

        // 4. Generate GoQR URL pointing to: <our-website>/booth/[id_booth]
        const origin = req.nextUrl.origin; // e.g. "http://localhost:3000"
        const targetUrl = `${origin}/booth/${booth.id}`;
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
                data: updatedBooth,
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
