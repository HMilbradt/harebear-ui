"use client"

import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  /** Classes for the wrapping div. `className` goes to the input. */
  wrapperClassName?: string
}

/** Password `Input` with a Show/Hide button that switches it to plain text. Props go to the input. */
function PasswordInput({ className, wrapperClassName, disabled, ...props }: PasswordInputProps) {
  const [shown, setShown] = React.useState(false)
  return (
    <div data-slot="password-input" className={cn("relative", wrapperClassName)}>
      <Input type={shown ? "text" : "password"} disabled={disabled} className={cn("pr-12", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        aria-label={shown ? "Hide password" : "Show password"}
        onClick={() => setShown((s) => !s)}
        className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground after:absolute after:-inset-1.5"
      >
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

export { PasswordInput }
