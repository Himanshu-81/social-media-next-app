import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const uploadThingFileRouter = {
  avatar: f({
    image: {
      maxFileSize: "512KB", // ✅ latest config style
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // Run auth check
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      // return only serializable data
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // ✅ UploadThing now gives you `file.ufsUrl` (use this instead of hacking the URL)
      const newAvatarUrl = file.ufsUrl;

      await prisma.user.update({
        where: { id: metadata.userId },
        data: { avatarUrl: newAvatarUrl },
      });

      return { avatarUrl: newAvatarUrl };
    }),
} satisfies FileRouter;

export type UploadThingFileRouter = typeof uploadThingFileRouter;
