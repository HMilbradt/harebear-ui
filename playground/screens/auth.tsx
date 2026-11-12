import { SparklesIcon } from "lucide-react"
import { useState } from "react"
import {
  AppBrand,
  AppleIcon,
  type AuthLayoutProps,
  AuthLayout,
  Field,
  FieldLabel,
  GitHubIcon,
  GoogleIcon,
  Input,
  LoginForm,
  SignupForm,
  Tabs,
  TabsList,
  TabsTrigger,
  ThemeToggle,
} from "@/index"

const cover = {
  src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=70",
  alt: "Mountain valley at dusk",
}

export function AuthScreen() {
  const [variant, setVariant] = useState<NonNullable<AuthLayoutProps["variant"]>>("centered")
  const [form, setForm] = useState<"login" | "email-only" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const fake = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1200)
  }

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-2">
        <Tabs value={variant} onValueChange={(v) => setVariant(v as typeof variant)}>
          <TabsList aria-label="Layout">
            {(["centered", "muted", "split", "card-image"] as const).map((v) => (
              <TabsTrigger key={v} value={v}>
                {v}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={form} onValueChange={(v) => setForm(v as typeof form)}>
          <TabsList aria-label="Form">
            <TabsTrigger value="login">login</TabsTrigger>
            <TabsTrigger value="email-only">email only</TabsTrigger>
            <TabsTrigger value="signup">signup</TabsTrigger>
          </TabsList>
        </Tabs>
        <ThemeToggle />
      </div>
      <AuthLayout
        variant={variant}
        brand={<AppBrand name="Console" icon={<SparklesIcon />} className="w-auto [&>div:nth-child(2)]:flex-none" />}
        image={cover}
        footer={
          <>
            By continuing you agree to the <a href="#auth">Terms</a> and <a href="#auth">Privacy Policy</a>.
          </>
        }
      >
        {form === "signup" ? (
          <SignupForm
            loginHref="#auth"
            loading={loading}
            onSubmit={fake}
            providers={[
              { id: "github", label: "GitHub", icon: <GitHubIcon /> },
              { id: "google", label: "Google", icon: <GoogleIcon /> },
            ]}
          >
            <Field>
              <FieldLabel htmlFor="signup-workspace">Workspace name</FieldLabel>
              <Input id="signup-workspace" name="workspace" required />
            </Field>
          </SignupForm>
        ) : (
          <LoginForm
            mode={form === "email-only" ? "email-only" : "password"}
            forgotPasswordHref="#auth"
            signupHref="#auth"
            loading={loading}
            onSubmit={fake}
            providers={[
              { id: "apple", label: "Apple", icon: <AppleIcon /> },
              { id: "google", label: "Google", icon: <GoogleIcon /> },
              { id: "github", label: "GitHub", icon: <GitHubIcon /> },
            ]}
          />
        )}
      </AuthLayout>
    </div>
  )
}
