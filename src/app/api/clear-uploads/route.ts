import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json(
        {
          error: "Invalid authorization header",
        },
        { status: 401 }
      );
    }

    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 24),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });

    const unusedMediaIds = unusedMedia.map(
      (m) => m.url.split("/")[m.url.split("/").length - 1]
    );

    await new UTApi().deleteFiles(unusedMediaIds);

    await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: "Failed to clear uploads",
      },
      { status: 500 }
    );
  }
}
