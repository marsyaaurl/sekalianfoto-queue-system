import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearAdminSession();

    return NextResponse.json(
      { message: "Logout successful." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error on user logout:", err);
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