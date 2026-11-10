import {
  CheckIcon,
  FileTextIcon,
  LogOutIcon,
  PencilIcon,
  ShieldCheckIcon,
  ShieldIcon,
  ShieldOffIcon,
  TerminalIcon,
  Trash2Icon,
} from "lucide-react"
import { useState } from "react"
import {
  AppBrand,
  ApprovalCard,
  ApprovalResult,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChatMessage,
  ChatPanel,
  ChatShell,
  ConfirmDialog,
  ConversationList,
  CopyField,
  groupByDate,
  InlineCode,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  KeyValueGrid,
  ModelPicker,
  NewConversationButton,
  PromptInput,
  PromptInputSelect,
  Prose,
  StatusBadge,
  StatusDot,
  ThemeToggle,
  ToolGroup,
  ToolStep,
  TypingIndicator,
  UserChip,
} from "@/index"

const now = Date.now()
const hour = 3600 * 1000
const chats = [
  { id: "disk", title: "Disk usage on services", updated: now - 2 * 60 * 1000, status: "waiting" as const },
  { id: "npm", title: "Add a proxy host for Immich", updated: now - hour, status: "working" as const },
  { id: "backup", title: "Check last night's backup", updated: now - 26 * hour },
  {
    id: "dns",
    title: "Split DNS with AdGuard and a really long title that needs to truncate",
    updated: now - 4 * 24 * hour,
  },
]
const live = {
  waiting: { text: "Waiting for you", tone: "warning" as const },
  working: { text: "Working", tone: "info" as const, pulse: true },
}

const modes = [
  {
    value: "ask",
    label: "Ask before changes",
    description: "Reads run on their own. Every change asks first.",
    icon: <ShieldIcon />,
  },
  {
    value: "always",
    label: "Ask for everything",
    description: "Every tool call asks first, reads included.",
    icon: <ShieldCheckIcon />,
  },
  {
    value: "off",
    label: "Permissions off",
    description: "Everything runs without asking. Secrets stay blocked.",
    icon: <ShieldOffIcon />,
    tone: "warning" as const,
  },
]

const df = `$ ssh services 'df -h /srv'

Filesystem      Size  Used Avail Use% Mounted on
/dev/sdb1       492G  431G   36G  93% /srv`

export function AgentScreen() {
  const [active, setActive] = useState("disk")
  const [draft, setDraft] = useState("")
  const [mode, setMode] = useState("ask")
  const [deleting, setDeleting] = useState<string | null>(null)
  const title = chats.find((c) => c.id === active)?.title

  const groups = groupByDate(
    chats,
    (c) => c.updated,
    (c) => {
      const l = c.status ? live[c.status] : null
      return {
        id: c.id,
        title: c.title,
        description: l ? l.text : new Date(c.updated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        tone: l?.tone,
        pulse: l && "pulse" in l ? l.pulse : undefined,
      }
    },
  )

  return (
    <ChatShell
      storageKey="playground-agent-sidebar"
      brand={<AppBrand name="netadmin" subtitle="Home network agent" icon={<TerminalIcon />} />}
      sidebarActions={<NewConversationButton />}
      sidebar={
        <ConversationList
          groups={groups}
          activeId={active}
          onSelect={setActive}
          renderAction={(c) => (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${c.title}`}
              onClick={() => setDeleting(c.title)}
            >
              <Trash2Icon />
            </Button>
          )}
        />
      }
      sidebarFooter={
        <UserChip
          name="harrison@example.com"
          subtitle="Signed in"
          action={
            <div className="flex shrink-0 items-center">
              <ThemeToggle />
              <Button variant="ghost" size="icon" aria-label="Sign out">
                <LogOutIcon />
              </Button>
            </div>
          }
        />
      }
      detailsTitle="Conversation details"
      details={<Details mode={modes.find((m) => m.value === mode)?.label ?? ""} />}
    >
      <ChatPanel
        title={title}
        description="Started Nov 10, 9:41"
        conversationId={active}
        notice="The agent process restarted. Approvals for this conversation were reset."
        actions={
          <>
            <ModelPicker
              value="claude-opus"
              onValueChange={() => {}}
              models={[{ id: "claude-opus", label: "Opus 5.5", description: "anthropic" }]}
            />
            <StatusBadge size="lg" tone="warning">
              <span className="hidden sm:inline">Waiting for you</span>
            </StatusBadge>
          </>
        }
        composer={
          <PromptInput
            value={draft}
            onValueChange={setDraft}
            onSubmit={() => setDraft("")}
            placeholder="Add a follow-up…"
            tools={
              <PromptInputSelect
                options={modes}
                value={mode}
                onValueChange={setMode}
                label="Permissions for this conversation"
              />
            }
            footer="The agent is waiting for your approval. A message you send now is queued until it finishes."
          />
        }
      >
        <ChatMessage role="user" variant="soft">
          Why is the services VM low on disk? Here is the path it complained about:
          /srv/appdata/immich/library/upload/thumbs/0f8c1b2a-really-long-path-segment-without-spaces-0123456789abcdef
        </ChatMessage>
        <ToolGroup title="Checked disk usage on services" status="done" meta="9:42">
          <ToolStep
            icon={<TerminalIcon />}
            kind="Run"
            detail="ssh services 'df -h /srv'"
            status="done"
            meta="3 lines"
            output={df}
          />
          <ToolStep icon={<FileTextIcon />} kind="Read" detail="docs/vms/services.md" status="done" meta="120 lines" />
          <ToolStep
            icon={<TerminalIcon />}
            kind="Run"
            detail="ssh services 'du -sh /srv/appdata/* | sort -h | tail'"
            status="error"
            meta="failed"
            output="du: cannot read directory '/srv/appdata/postgres': Permission denied"
          />
        </ToolGroup>
        <Prose>
          <p>
            <strong>/srv is 93% full.</strong> Immich's thumbnail cache is the biggest directory. Docker's build cache
            holds another 18 GB that is safe to prune.
          </p>
        </Prose>
        <ApprovalResult decision="approved" time="9:43">
          You approved <InlineCode>ssh services 'docker system df'</InlineCode>, once
        </ApprovalResult>
        <ApprovalCard
          title="Approval needed: run a command on services"
          description="Ask before changes · asked 9:44"
          code="ssh services 'docker builder prune --force --filter until=168h'"
          codeLabel="bash"
          actions={
            <>
              <Button>
                <CheckIcon />
                Approve once
              </Button>
              <Button variant="secondary">Approve for this conversation</Button>
              <Button variant="outline">Deny</Button>
            </>
          }
          footer={
            <>
              For this conversation covers <InlineCode>docker builder prune</InlineCode> until its agent process stops.
            </>
          }
        >
          <strong>Why: </strong>Frees about 18 GB of build cache older than a week. Images and volumes are untouched.
        </ApprovalCard>
        <TypingIndicator label="Working" variant="primary" />
      </ChatPanel>
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete “${deleting}”?`}
        description="The conversation file is removed and cannot be restored from here."
        confirmLabel="Delete"
        destructive
        onConfirm={() => setDeleting(null)}
      />
    </ChatShell>
  )
}

function Details({ mode }: { mode: string }) {
  return (
    <>
      <Card size="sm">
        <CardHeader>
          <CardTitle>This conversation</CardTitle>
          <CardDescription>Agent process running</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <KeyValueGrid
            columns={2}
            items={[
              { label: "Model", value: "Opus 5.5" },
              { label: "Permissions", value: mode },
              { label: "Started", value: "9:41" },
              { label: "Tool calls", value: "4" },
            ]}
          />
          <CopyField
            label="File"
            aria-label="Session file"
            value="/srv/appdata/netadmin/pi-agent/sessions/2026-11-10T09-41-12_disk.jsonl"
            display="2026-11-10T09-41-12_disk.jsonl"
          />
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            <Item size="xs">
              <ItemMedia>
                <StatusDot tone="warning" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Waiting for you</ItemTitle>
              </ItemContent>
            </Item>
            <Item size="xs">
              <ItemMedia>
                <StatusDot tone="success" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="font-mono">ssh services 'docker system df --verbose --format json'</ItemTitle>
                <ItemDescription>once · 9:43</ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Files changed</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            <Item size="xs">
              <ItemMedia variant="icon">
                <PencilIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="font-mono">docs/vms/services.md</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Badge variant="secondary">edited</Badge>
              </ItemActions>
            </Item>
          </ItemGroup>
        </CardContent>
      </Card>
    </>
  )
}
