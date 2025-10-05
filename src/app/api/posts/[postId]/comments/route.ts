import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { CommentsPage, getCommentDataSelect } from "@/lib/types";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { postId } = await params;

  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 5;

    const { user } = await validateRequest();
    if (!user)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: getCommentDataSelect(user.id),
      orderBy: { createdAt: "asc" },
      take: -pageSize - 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const prevCursor = comments.length > pageSize ? comments[0].id : null;

    const data: CommentsPage = {
      comments: comments.length > pageSize ? comments.slice(1) : comments,
      previousCursor: prevCursor,
    };

    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
