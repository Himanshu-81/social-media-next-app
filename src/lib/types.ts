import { Prisma } from "@/generated/prisma";

export const userDataSelect = {
  username: true,
  displayName: true,
  avatarUrl: true,
  id: true,
} satisfies Prisma.UserSelect;

export const PostDataInclude = {
  user: {
    select: userDataSelect,
  },
} satisfies Prisma.PostInclude;

export type PostData = Prisma.PostGetPayload<{
  include: typeof PostDataInclude;
}>;
