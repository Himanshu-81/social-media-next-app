import { useUploadThing } from "@/lib/uploadThing";
import { useState } from "react";
import { toast } from "sonner";

export interface Attachment {
  isUploading: boolean;
  file: File;
  mediaId?: string;
}

export default function useMediaUpload() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();

        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          { type: file.type }
        );
      });

      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({ file, isUploading: true })),
      ]);

      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((att) => {
          const uploadResult = res.find((r) => r.name === att.file.name);

          if (!uploadResult) return att;

          return {
            ...att,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        })
      );
    },
    onUploadError(e) {
      setAttachments((prev) => prev.filter((a) => !a.isUploading));
      toast.error(`Upload failed: ${e.message}`);
    },
  });

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast.error("Please wait for the current upload to finish.");
      return;
    }

    if (attachments.length + files.length > 5) {
      toast.error("You can only upload up to 5 media items.");
      return;
    }
    startUpload(files);
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  function clearAttachments() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    clearAttachments,
  };
}
