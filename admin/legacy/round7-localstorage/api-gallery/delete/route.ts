import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const publicId = body.public_id;
    const resourceType = body.resource_type || "image";

    if (!publicId) {
      return NextResponse.json(
        {
          success: false,
          error: "public_id is required",
        },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
        invalidate: true,
      }
    );

    if (result.result !== "ok") {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary could not delete the asset",
          result: result.result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      public_id: publicId,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete asset",
      },
      { status: 500 }
    );
  }
}