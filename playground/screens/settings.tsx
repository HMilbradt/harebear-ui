import { BellIcon, ClockIcon, HomeIcon, PaletteIcon, SettingsIcon, UserIcon, XIcon } from "lucide-react"
import { useState } from "react"
import {
  AvatarUpload,
  Button,
  type CategoryColor,
  ColorSwatchPicker,
  FocusLayout,
  Input,
  MemberAvatar,
  SettingsDialog,
  SettingsRow,
  SettingsSection,
  Switch,
  TimeZonePicker,
  toast,
  ToggleGroup,
  ToggleGroupItem,
  useTheme,
  type ThemeMode,
} from "@/index"

const members: { name: string; color: CategoryColor }[] = [
  { name: "Maya Chen", color: 1 },
  { name: "Sam Rivera", color: 2 },
  { name: "Ada Chen", color: 4 },
]

export function SettingsScreen() {
  const { mode, setMode } = useTheme()
  const [password, setPassword] = useState(false)
  const [color, setColor] = useState<CategoryColor>(1)
  const [zone, setZone] = useState("America/Vancouver")
  // SettingsDialog: the same sections in a modal that can open over any page.
  const [dialog, setDialog] = useState(false)
  const [section, setSection] = useState("you")
  const you = (
    <SettingsSection title="You">
      <div className="flex flex-col gap-5 py-4">
        <AvatarUpload
          name="Maya Chen"
          color={color}
          maxBytes={512 * 1024}
          onChange={() => {}}
          description="Shows next to your name everywhere. Without a photo, your initial and colour are used."
        />
        <div className="flex flex-col gap-2">
          <span id="colour-label" className="text-[13px] font-medium">
            Your colour
          </span>
          <ColorSwatchPicker
            aria-labelledby="colour-label"
            value={color}
            onValueChange={setColor}
            taken={{ 2: "Sam Rivera", 4: "Ada Chen" }}
          />
        </div>
      </div>
    </SettingsSection>
  )
  const appearance = (
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
  )
  const time = (
    <SettingsSection title="Time">
      <SettingsRow
        label="Time zone"
        description="Due dates and the morning summary follow it."
        htmlFor="settings-zone"
        body={
          <TimeZonePicker
            id="settings-zone"
            value={zone}
            onValueChange={(z) => {
              setZone(z)
              toast.success("Time zone saved")
            }}
          />
        }
      />
    </SettingsSection>
  )
  const notifications = (
    <SettingsSection title="Notifications" description="HomeBot only sends what you turn on here.">
      <SettingsRow
        label="Morning summary"
        description="Every day at 7 am"
        htmlFor="summary"
        control={<Switch id="summary" defaultChecked />}
      />
      <SettingsRow label="When someone assigns you a to-do" htmlFor="assign" control={<Switch id="assign" />} />
    </SettingsSection>
  )
  const household = (
    <SettingsSection title="Household">
      {members.map((m) => (
        <SettingsRow
          key={m.name}
          label={
            <span className="flex items-center gap-2">
              <MemberAvatar name={m.name} color={m.color} size="sm" aria-hidden="true" />
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
  )
  const account = (
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
  )
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
      <SettingsDialog
        open={dialog}
        onOpenChange={setDialog}
        value={section}
        onValueChange={setSection}
        sections={[
          { id: "you", label: "You", icon: <UserIcon />, content: you },
          { id: "appearance", label: "Appearance", icon: <PaletteIcon />, content: appearance },
          { id: "time", label: "Time", icon: <ClockIcon />, content: time },
          { id: "notifications", label: "Notifications", icon: <BellIcon />, content: notifications },
          { id: "household", label: "Household", icon: <HomeIcon />, content: household },
          { id: "account", label: "Account", icon: <SettingsIcon />, content: account },
        ]}
      />
      <Button variant="outline" className="self-start" onClick={() => setDialog(true)}>
        Open as a dialog
      </Button>
      {you}
      {appearance}
      {time}
      {notifications}
      {household}
      {account}
    </FocusLayout>
  )
}
