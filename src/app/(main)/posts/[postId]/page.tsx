import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import prisma from "@/lib/prisma";
import { getPostDataSelect, UserData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: getPostDataSelect(loggedInUserId),
  });

  if (!post) notFound();
  return post;
});

// ✅ PageProps uses Promise for params
export default async function Page({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const { user } = await validateRequest();

  if (!user)
    return (
      <p className="text-destructive">
        You are not authorized to view this page
      </p>
    );

  const post = await getPost(postId, user.id);

  return (
    <main className="w-full flex min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} />
      </div>
      <div className="sticky top-[5.25rem] hidden md:block w-80 h-fit">
        <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
          <UserInfoSidebar user={post.user} />
        </Suspense>
      </div>
    </main>
  );
}

// ✅ Metadata generator
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ postId: string }>;
}) => {
  const { postId } = await params;
  const { user } = await validateRequest();
  if (!user) return {};
  const post = await getPost(postId, user.id);
  return { title: `${post.user.displayName}: ${post.content.slice(0, 50)}...` };
};

// Sidebar component
interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return null;

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">About this user</div>
      <UserTooltip user={user}>
        <Link
          href={`/users/${user.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
          <div>
            <p className="hover:underline font-semibold line-clamp-1 break-all">
              {user.displayName}
            </p>
            <p className="text-muted-foreground line-clamp-1 break-all">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>

      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
          {user.bio}
        </div>
      </Linkify>

      {user.id !== loggedInUser.id && (
        <FollowButton
          userId={user.id}
          initialState={{
            followers: user._count.followers,
            isFollowedByUser: user.followers.some(
              (f) => f.followerId === loggedInUser.id
            ),
          }}
        />
      )}
    </div>
  );
}
