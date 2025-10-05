import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const { userId } = await params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: { followingId: loggedInUser.id },
          select: { followerId: true },
        },
        _count: { select: { followers: true } },
      },
    });

    if (!user)
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  const { userId } = await params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: { followerId: loggedInUser.id, followingId: userId },
        update: {},
      }),
      prisma.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
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

export async function DELETE(req: Request, { params }: RouteParams) {
  const { userId } = await params;

  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: { followerId: loggedInUser.id, followingId: userId },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
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
