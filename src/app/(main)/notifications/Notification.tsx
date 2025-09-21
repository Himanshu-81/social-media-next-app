import UserAvatar from "@/components/UserAvatar";
import { NotificationType } from "@/generated/prisma";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import { JSX } from "react";

interface NotificationProps {
  notifications: NotificationData;
}

export default function Notification({ notifications }: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notifications.issuer.displayName} started following you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/users/${notifications.issuer.username}`,
    },
    LIKE: {
      message: `${notifications.issuer.displayName} liked your post`,
      icon: <Heart className="size-7 text-red-500 fill-red-500" />,
      href: `/posts/${notifications.postId}`,
    },
    COMMENT: {
      message: `${notifications.issuer.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 text-primary" />,
      href: `/posts/${notifications.postId}`,
    },
  };

  const { message, icon, href } = notificationTypeMap[notifications.type];

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notifications.read && "bg-primary/10"
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notifications.issuer.avatarUrl} size={36} />
          <div>
            <span className="font-bold">
              {notifications.issuer.displayName}
            </span>{" "}
            <span>{message}</span>
          </div>

          {notifications.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {notifications.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
