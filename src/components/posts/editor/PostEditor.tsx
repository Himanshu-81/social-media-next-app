"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from "./actions";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";

export default function PostEditor() {
  const { user } = useSession();

  const mutation = useSubmitPostMutation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Placeholder.configure({ placeholder: "What's on your mind?" }),
    ],
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  function onSubmit() {
    mutation.mutate(input, {
      onSuccess: () => {
        editor?.commands.clearContent();
      },
    });
    editor?.commands.clearContent();
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-xl">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <EditorContent
          editor={editor}
          className={cn(
            "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-muted px-5 py-3"
          )}
        />
      </div>
      <div className="flex justify-end">
        <LoadingButton
          onClick={onSubmit}
          disabled={!input.trim()}
          className="min-w-20"
          loading={mutation.isPending}
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}
