import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "maarga/gallery",
      resource_type: "image",
      max_results: 100,
    });

    return NextResponse.json({
      success: true,
      assets: result.resources,
    });
  } catch (error) {
    console.error("Cloudinary fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gallery assets",
      },
      { status: 500 }
    );
  }
}