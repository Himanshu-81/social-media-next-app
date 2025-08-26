import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

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
      return { user: user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const oldAvatarUrl = metadata.user.avatarUrl;

      if (oldAvatarUrl) {
        const key = oldAvatarUrl.split("/").pop();
        if (key) await new UTApi().deleteFiles(key);
      }

      const newAvatarUrl = file.ufsUrl;

      await prisma.user.update({
        where: { id: metadata.user.id },
        data: { avatarUrl: newAvatarUrl },
      });

      return { avatarUrl: newAvatarUrl };
    }),
} satisfies FileRouter;

export type UploadThingFileRouter = typeof uploadThingFileRouter;
