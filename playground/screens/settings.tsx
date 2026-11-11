import { XIcon } from "lucide-react"
import { useState } from "react"
import {
  Button,
  FocusLayout,
  Input,
  SettingsRow,
  SettingsSection,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  useTheme,
  type ThemeMode,
} from "@/index"

const members = [
  { name: "Maya Chen", color: "bg-category-1" },
  { name: "Sam Rivera", color: "bg-category-2" },
  { name: "Ada Chen", color: "bg-category-4" },
]

export function SettingsScreen() {
  const { mode, setMode } = useTheme()
  const [password, setPassword] = useState(false)
  return (
    <FocusLayout
      title="Settings"
      back={
        <Button asChild variant="ghost" size="icon">
          <a href="#household" aria-label="Close settings">
            <XIcon />
          </a>
        </Button>
      }
    >
      <SettingsSection title="Appearance">
        <SettingsRow
          label="Theme"
          description="Follow the device, or pick one."
          control={
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => v && setMode(v as ThemeMode)}
              aria-label="Theme"
            >
              <ToggleGroupItem value="light">Light</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
              <ToggleGroupItem value="system">System</ToggleGroupItem>
            </ToggleGroup>
          }
        />
      </SettingsSection>
      <SettingsSection title="Notifications" description="HomeBot only sends what you turn on here.">
        <SettingsRow
          label="Morning summary"
          description="Every day at 7 am"
          htmlFor="summary"
          control={<Switch id="summary" defaultChecked />}
        />
        <SettingsRow label="When someone assigns you a to-do" htmlFor="assign" control={<Switch id="assign" />} />
      </SettingsSection>
      <SettingsSection title="Household">
        {members.map((m) => (
          <SettingsRow
            key={m.name}
            label={
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className={`size-3 rounded-full ${m.color}`} />
                {m.name}
              </span>
            }
            control={
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            }
          />
        ))}
      </SettingsSection>
      <SettingsSection title="Account">
        <SettingsRow
          label="Password"
          description="Last changed in May"
          open={password}
          onOpenChange={setPassword}
          content={
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                setPassword(false)
              }}
            >
              <Input type="password" aria-label="New password" placeholder="New password" autoComplete="new-password" />
              <Button type="submit" className="self-start">
                Save password
              </Button>
            </form>
          }
        />
      </SettingsSection>
    </FocusLayout>
  )
}
