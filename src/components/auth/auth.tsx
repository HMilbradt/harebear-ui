"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

// Layout --------------------------------------------------------------------

export interface AuthLayoutProps {
  /**
   * - "centered": form in a card, centered on the page (shadcn login-01 / signup-01)
   * - "muted": same on a muted page background (login-03 / signup-03)
   * - "split": two columns, form left and a cover image right; no card (login-02 / signup-02)
   * - "card-image": one wide card with the form and an image side by side (login-04 / signup-04)
   */
  variant?: "centered" | "muted" | "split" | "card-image"
  /** Logo/product name shown above the form (top-left in "split"). Usually <AppBrand />. */
  brand?: React.ReactNode
  /** Cover image for "split" and "card-image". */
  image?: { src: string; alt: string }
  /** Small print under the form, e.g. terms links. */
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Full-page wrapper for sign-in and sign-up screens. Put LoginForm or SignupForm inside. */
function AuthLayout({ variant = "centered", brand, image, footer, className, children }: AuthLayoutProps) {
  const img = image && (
    <img
      src={image.src}
      alt={image.alt}
      className="absolute inset-0 size-full object-cover dark:brightness-[0.6] dark:grayscale-[0.3]"
    />
  )
  const small = footer && (
    <div className="text-center text-xs text-balance text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-foreground">
      {footer}
    </div>
  )

  if (variant === "split") {
    return (
      <div data-slot="auth-layout" data-variant={variant} className={cn("grid min-h-svh lg:grid-cols-2", className)}>
        <div className="flex flex-col gap-4 p-6 md:p-10">
          {brand && <div className="flex justify-center md:justify-start">{brand}</div>}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex w-full max-w-sm flex-col gap-6">
              {children}
              {small}
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">{img}</div>
      </div>
    )
  }

  const wide = variant === "card-image"
  return (
    <div
      data-slot="auth-layout"
      data-variant={variant}
      className={cn(
        "flex min-h-svh flex-col items-center justify-center p-6 md:p-10",
        variant === "muted" && "bg-muted",
        className,
      )}
    >
      <div className={cn("flex w-full flex-col gap-6", wide ? "max-w-sm md:max-w-4xl" : "max-w-sm")}>
        {brand && <div className="flex justify-center">{brand}</div>}
        {wide ? (
          <Card className="overflow-hidden py-0">
            <div className="grid md:grid-cols-2">
              <div className="p-6 md:p-8">{children}</div>
              <div className="relative hidden min-h-80 bg-muted md:block">{img}</div>
            </div>
          </Card>
        ) : (
          <Card>
            <CardContent>{children}</CardContent>
          </Card>
        )}
        {small}
      </div>
    </div>
  )
}

// Providers -----------------------------------------------------------------

export interface AuthProvider {
  /** Passed to onProviderClick, e.g. "github". */
  id: string
  /** Display name, e.g. "GitHub". */
  label: string
  icon?: React.ReactNode
}

function ProviderButtons({
  providers,
  verb,
  onProviderClick,
  disabled,
}: {
  providers: AuthProvider[]
  verb: string
  onProviderClick?: (id: string) => void
  disabled?: boolean
}) {
  // Three or more providers with icons collapse to an icon row.
  const compact = providers.length >= 3 && providers.every((p) => p.icon)
  return (
    <Field
      className={cn(compact && "grid gap-3")}
      style={compact ? { gridTemplateColumns: `repeat(${providers.length}, minmax(0, 1fr))` } : undefined}
    >
      {providers.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onProviderClick?.(p.id)}
          aria-label={compact ? `${verb} with ${p.label}` : undefined}
        >
          {p.icon}
          {!compact && `${verb} with ${p.label}`}
        </Button>
      ))}
    </Field>
  )
}

function BrandSvg({ d, ...props }: React.ComponentProps<"svg"> & { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d={d} fill="currentColor" />
    </svg>
  )
}

/** GitHub mark, for AuthProvider icons. */
function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <BrandSvg
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      {...props}
    />
  )
}

/** Google "G" mark, for AuthProvider icons. */
const GOOGLE_PATH =
  "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
function GoogleIcon(props: React.ComponentProps<"svg">) {
  return <BrandSvg d={GOOGLE_PATH} {...props} />
}

const APPLE_PATH =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
/** Apple mark, for AuthProvider icons. */
function AppleIcon(props: React.ComponentProps<"svg">) {
  return <BrandSvg d={APPLE_PATH} {...props} />
}

// Shared --------------------------------------------------------------------

interface AuthFormBase extends Omit<React.ComponentProps<"form">, "onSubmit" | "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Social/SSO buttons shown under the main button. */
  providers?: AuthProvider[]
  onProviderClick?: (id: string) => void
  /** Shows a spinner on the submit button and disables the form. */
  loading?: boolean
  /** Form-level error, e.g. "Invalid email or password". */
  error?: React.ReactNode
  /** Put the provider buttons above the email form instead of below. */
  providersFirst?: boolean
}

function Header({ title, description }: { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h1>
      {description && <p className="text-sm text-balance text-muted-foreground">{description}</p>}
    </div>
  )
}

function readForm(form: HTMLFormElement) {
  return Object.fromEntries(
    [...new FormData(form).entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]),
  ) as Record<string, string>
}

// Login ---------------------------------------------------------------------

export interface LoginValues {
  email: string
  /** Absent in "email-only" mode. */
  password?: string
}

export interface LoginFormProps extends AuthFormBase {
  /** Called with the entered values. Omit to let the form submit natively (e.g. to an `action`). */
  onSubmit?: (values: LoginValues) => void | Promise<void>
  /** "email-only" drops the password field for magic-link or OTP flows (shadcn login-05). */
  mode?: "password" | "email-only"
  forgotPasswordHref?: string
  signupHref?: string
  submitLabel?: React.ReactNode
}

/** Email + password sign-in form with optional SSO buttons. Pair with AuthLayout. */
function LoginForm({
  title = "Welcome back",
  description,
  onSubmit,
  mode = "password",
  providers = [],
  onProviderClick,
  providersFirst,
  forgotPasswordHref,
  signupHref,
  submitLabel,
  loading,
  error,
  className,
  ...props
}: LoginFormProps) {
  const id = React.useId()
  const emailOnly = mode === "email-only"
  const desc =
    description ?? (emailOnly ? "Enter your email and we'll send you a sign-in link" : "Sign in to your account")
  const sso = providers.length > 0 && (
    <ProviderButtons providers={providers} verb="Continue" onProviderClick={onProviderClick} disabled={loading} />
  )
  return (
    <form
      data-slot="login-form"
      className={cn("flex flex-col gap-6", className)}
      onSubmit={
        onSubmit
          ? (e) => {
              e.preventDefault()
              const v = readForm(e.currentTarget)
              onSubmit(emailOnly ? { email: v.email ?? "" } : { email: v.email ?? "", password: v.password ?? "" })
            }
          : undefined
      }
      aria-busy={loading || undefined}
      {...props}
    >
      <FieldGroup>
        <Header title={title} description={desc} />
        {providersFirst && sso}
        {providersFirst && sso && <FieldSeparator>Or continue with email</FieldSeparator>}
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </Field>
        {!emailOnly && (
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
              {forgotPasswordHref && (
                <a
                  href={forgotPasswordHref}
                  className="ms-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </a>
              )}
            </div>
            <PasswordInput
              id={`${id}-password`}
              name="password"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </Field>
        )}
        {error && <FieldError>{error}</FieldError>}
        <Field>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner />}
            {submitLabel ?? (emailOnly ? "Send sign-in link" : "Sign in")}
          </Button>
        </Field>
        {!providersFirst && sso && <FieldSeparator>Or continue with</FieldSeparator>}
        {!providersFirst && sso}
        {signupHref && (
          <FieldDescription className="text-center">
            Don&apos;t have an account? <a href={signupHref}>Sign up</a>
          </FieldDescription>
        )}
      </FieldGroup>
    </form>
  )
}

// Signup --------------------------------------------------------------------

export interface SignupValues {
  name?: string
  email: string
  password: string
}

export interface SignupFormProps extends AuthFormBase {
  onSubmit?: (values: SignupValues) => void | Promise<void>
  /** Ask for a full name. Default true. */
  nameField?: boolean
  /** Ask for the password twice; mismatches are reported before onSubmit. Default true. */
  confirmPassword?: boolean
  /** Hint under the password field. */
  passwordHint?: React.ReactNode
  /** Minimum password length enforced by the browser. Default 8. */
  minPasswordLength?: number
  loginHref?: string
  submitLabel?: React.ReactNode
}

/** Account creation form: name, email, password (+ confirm), optional SSO. Pair with AuthLayout. */
function SignupForm({
  title = "Create your account",
  description = "Enter your details to get started",
  onSubmit,
  nameField = true,
  confirmPassword = true,
  passwordHint,
  minPasswordLength = 8,
  providers = [],
  onProviderClick,
  providersFirst,
  loginHref,
  submitLabel = "Create account",
  loading,
  error,
  className,
  ...props
}: SignupFormProps) {
  const id = React.useId()
  const sso = providers.length > 0 && (
    <ProviderButtons providers={providers} verb="Sign up" onProviderClick={onProviderClick} disabled={loading} />
  )
  return (
    <form
      data-slot="signup-form"
      className={cn("flex flex-col gap-6", className)}
      onSubmit={(e) => {
        const form = e.currentTarget
        const v = readForm(form)
        const confirm = form.elements.namedItem("confirm") as HTMLInputElement | null
        if (confirm) {
          confirm.setCustomValidity(v.confirm === v.password ? "" : "Passwords do not match")
          if (!confirm.reportValidity()) {
            e.preventDefault()
            return
          }
        }
        if (!onSubmit) return
        e.preventDefault()
        onSubmit({ ...(nameField ? { name: v.name ?? "" } : {}), email: v.email ?? "", password: v.password ?? "" })
      }}
      aria-busy={loading || undefined}
      {...props}
    >
      <FieldGroup>
        <Header title={title} description={description} />
        {providersFirst && sso}
        {providersFirst && sso && <FieldSeparator>Or sign up with email</FieldSeparator>}
        {nameField && (
          <Field>
            <FieldLabel htmlFor={`${id}-name`}>Full name</FieldLabel>
            <Input id={`${id}-name`} name="name" autoComplete="name" required disabled={loading} />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-password`}>Password</FieldLabel>
          <PasswordInput
            id={`${id}-password`}
            name="password"
            autoComplete="new-password"
            onInput={(e) =>
              (e.currentTarget.form?.elements.namedItem("confirm") as HTMLInputElement | null)?.setCustomValidity("")
            }
            minLength={minPasswordLength}
            required
            disabled={loading}
          />
          <FieldDescription>{passwordHint ?? `At least ${minPasswordLength} characters.`}</FieldDescription>
        </Field>
        {confirmPassword && (
          <Field>
            <FieldLabel htmlFor={`${id}-confirm`}>Confirm password</FieldLabel>
            <PasswordInput
              id={`${id}-confirm`}
              name="confirm"
              autoComplete="new-password"
              required
              disabled={loading}
              onInput={(e) => e.currentTarget.setCustomValidity("")}
            />
          </Field>
        )}
        {error && <FieldError>{error}</FieldError>}
        <Field>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner />}
            {submitLabel}
          </Button>
        </Field>
        {!providersFirst && sso && <FieldSeparator>Or continue with</FieldSeparator>}
        {!providersFirst && sso}
        {loginHref && (
          <FieldDescription className="text-center">
            Already have an account? <a href={loginHref}>Sign in</a>
          </FieldDescription>
        )}
      </FieldGroup>
    </form>
  )
}

export { AuthLayout, LoginForm, SignupForm, GitHubIcon, GoogleIcon, AppleIcon }
