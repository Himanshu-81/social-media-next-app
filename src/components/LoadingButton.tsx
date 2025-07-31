import React from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ShadcnButtonProps = React.ComponentProps<typeof Button>;
interface LoadingButtonProps extends ShadcnButtonProps {
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {props.children}
    </Button>
  );
}
