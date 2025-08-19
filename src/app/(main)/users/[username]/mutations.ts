import { useUploadThing } from "@/lib/uploadThing";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateUserProfile } from "./actions";
import { PostsPage } from "@/lib/types";

export function useUpdateProfileMutation() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([
        updateUserProfile(values),
        avatar && startAvatarUpload([avatar]),
      ]);
    },
    onSuccess: async ([updatedUser, uploadResult]) => {
      const newAvatarUrl = uploadResult?.[0].serverData.avatarUrl;

      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      avatar: newAvatarUrl || updatedUser.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      router.refresh();

      toast.success("Profile updated successfully");
    },

    onError: (error) => {
      console.error(error);
      toast.error("Failed to update profile. Please try again later.", {
        duration: 3000,
      });
    },
  });

  return mutation;
}
