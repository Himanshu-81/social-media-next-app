import React, { useState } from "react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          autoComplete="off"
          className={cn("pe-10", className)}
          ref={ref}
          {...props}
        />

        <button
          type="button"
          title={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground"
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
