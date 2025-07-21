import { Prisma } from "@/generated/prisma";

export const PostDataInclude = {
  user: {
    select: {
      username: true,
      avatarUrl: true,
      displayName: true,
    },
  },
} satisfies Prisma.PostInclude;

export type PostData = Prisma.PostGetPayload<{
  include: typeof PostDataInclude;
}>;
