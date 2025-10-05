import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";

interface RouteParams {
  params: Promise<{ postId: string }>; // ✅ must be a Promise
}

export async function GET(req: Request, { params }: RouteParams) {
  const { postId } = await params; // ✅ await params

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: { where: { userId: loggedInUser.id }, select: { userId: true } },
        _count: { select: { likes: true } },
      },
    });

    if (!post)
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
      });

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };
    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  const { postId } = await params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post)
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
      });

    await prisma.$transaction([
      prisma.like.upsert({
        where: { userId_postId: { userId: loggedInUser.id, postId } },
        create: { userId: loggedInUser.id, postId },
        update: {},
      }),
      ...(loggedInUser.id !== post.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: post.userId,
                postId,
                type: "LIKE",
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { postId } = await params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post)
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
      });

    await prisma.$transaction([
      prisma.like.deleteMany({ where: { userId: loggedInUser.id, postId } }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
