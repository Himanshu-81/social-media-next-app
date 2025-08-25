import { useUploadThing } from "@/lib/uploadThing";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { updateUserProfile } from "./actions";
import { PostsPage } from "@/lib/types";
import { useRouter } from "next/navigation";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { startUpload } = useUploadThing("avatar");
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([
        updateUserProfile(values),
        avatar ? startUpload([avatar]) : null,
      ]);
    },

    onSuccess: async ([updatedUser, uploadResult]) => {
      const newAvatarUrl = uploadResult?.[0].serverData.avatarUrl;
      const finalUser = {
        ...updatedUser,
        avatarUrl: newAvatarUrl || updatedUser.avatarUrl,
      };

      queryClient.setQueryData(
        ["user"],
        (old: InfiniteData<PostsPage, string | null> | undefined) => ({
          ...old,
          ...finalUser,
        })
      );

      queryClient.setQueriesData<InfiniteData<PostsPage>>(
        { queryKey: ["post-feed"] },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              posts: p.posts.map((post) =>
                post.user.id === finalUser.id
                  ? { ...post, user: { ...post.user, ...finalUser } }
                  : post
              ),
            })),
          }
      );

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["user"] }),
        queryClient.refetchQueries({ queryKey: ["post-feed"] }),
      ]);

      router.refresh();
      toast.success("Profile updated successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error("Failed to update profile. Please try again later.");
    },
  });
}
