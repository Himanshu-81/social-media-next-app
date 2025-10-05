import { validateRequest } from "@/auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getPostDataSelect, PostsPage } from "@/lib/types";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { userId } = await params;

  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();
    if (!user)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const posts = await prisma.post.findMany({
      where: { userId },
      include: getPostDataSelect(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = { posts: posts.slice(0, pageSize), nextCursor };

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
