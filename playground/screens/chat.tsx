import {
  EllipsisIcon,
  FileTextIcon,
  GlobeIcon,
  NotebookIcon,
  PanelLeftIcon,
  SettingsIcon,
  ShareIcon,
  SquarePenIcon,
} from "lucide-react"
import { useState } from "react"
import {
  Button,
  Card,
  ChatMessage,
  ChatThread,
  CodeBlock,
  ConversationList,
  InlineCode,
  Kbd,
  MessageActions,
  ModelPicker,
  PromptInput,
  PromptInputChip,
  Prose,
  SearchInput,
  ThemeToggle,
  ToolCall,
  TypingIndicator,
  UserChip,
} from "@/index"

const groups = [
  {
    label: "Today",
    items: [
      { id: "gpu", title: "GPU passthrough on Proxmox" },
      { id: "nginx", title: "Nginx reverse proxy for Immich" },
      { id: "backup", title: "Restic backup schedule" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { id: "zfs", title: "ZFS pool scrub warnings" },
      { id: "dns", title: "Split DNS with AdGuard" },
    ],
  },
  {
    label: "Previous 7 days",
    items: [
      { id: "k3s", title: "k3s vs plain Docker" },
      { id: "ups", title: "UPS shutdown script" },
      { id: "vlan", title: "VLAN for IoT devices" },
    ],
  },
]

const code = `# /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt"
update-grub

# /etc/modules
vfio
vfio_iommu_type1
vfio_pci`

export function ChatScreen() {
  const [active, setActive] = useState("gpu")
  const [model, setModel] = useState("llama3.1:8b")
  const [draft, setDraft] = useState("")
  const [web, setWeb] = useState(false)
  const [notes, setNotes] = useState(true)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  const title = groups.flatMap((g) => g.items).find((c) => c.id === active)?.title

  return (
    <div className="flex min-h-svh flex-wrap items-stretch">
      <aside className="flex max-w-full flex-[1_1_280px] flex-col gap-5 px-3.5 py-5 md:max-w-80">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-8.5 place-items-center rounded-full bg-primary text-primary-foreground">
            <NotebookIcon className="size-[18px]" />
          </div>
          <span className="flex-1 text-[15px] font-semibold">Assistant</span>
          <Button variant="ghost" size="icon" aria-label="Collapse sidebar">
            <PanelLeftIcon />
          </Button>
        </div>
        <div className="flex flex-col gap-2.5 px-0.5">
          <Button variant="secondary" className="w-full justify-start">
            <SquarePenIcon />
            <span className="flex-1 text-left">New chat</span>
            <Kbd>⌘N</Kbd>
          </Button>
          <SearchInput placeholder="Search chats" aria-label="Search chats" className="border-border bg-transparent" />
        </div>
        <ConversationList groups={groups} activeId={active} onSelect={setActive} className="flex-1" />
        <UserChip
          name="Harrison M"
          subtitle="Local · Ollama"
          className="px-2 pt-3"
          action={
            <Button variant="ghost" size="icon" aria-label="Settings">
              <SettingsIcon />
            </Button>
          }
        />
      </aside>

      <main className="flex min-w-0 flex-[999_1_560px] p-3">
        <Card className="h-[calc(100svh-24px)] min-w-0 flex-1 gap-0 py-0">
          <header className="flex flex-wrap items-center gap-3 py-3.5 pr-4.5 pl-6">
            <div className="flex min-w-50 flex-1 flex-col">
              <h1 className="truncate text-[15px] font-semibold">{title}</h1>
              <span className="text-xs font-medium text-muted-foreground">4 messages · started 14 min ago</span>
            </div>
            <ModelPicker
              value={model}
              onValueChange={setModel}
              models={[
                { id: "llama3.1:8b", description: "Fast, general purpose" },
                { id: "qwen2.5-coder:14b", description: "Code and shell" },
                { id: "mistral-nemo:12b", status: "warning", description: "Loading…" },
              ]}
            />
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Share">
              <ShareIcon />
            </Button>
            <Button variant="ghost" size="icon" aria-label="More options">
              <EllipsisIcon />
            </Button>
          </header>

          <ChatThread>
            <ChatMessage role="user">
              I want to pass my GPU through to a VM on Beast. What do I need to set up on the Proxmox host first?
            </ChatMessage>
            <ChatMessage
              role="assistant"
              actions={
                <MessageActions copyText={code} onRegenerate={() => {}} feedback={feedback} onFeedback={setFeedback} />
              }
            >
              <ToolCall icon={<FileTextIcon />}>Read 2 notes from homelab/</ToolCall>
              <Prose>
                <p>There are three things to get right on the host before the VM ever sees the card:</p>
                <ol>
                  <li>
                    <strong>Turn on IOMMU in the BIOS.</strong> On most boards it is listed as SVM / AMD-Vi or VT-d.
                  </li>
                  <li>
                    <strong>Enable it in the kernel.</strong> Add the flags to your boot command line, then rebuild the
                    bootloader config.
                  </li>
                  <li>
                    <strong>Load the VFIO modules</strong> so the host hands the GPU to the VM instead of grabbing it.
                  </li>
                </ol>
              </Prose>
              <CodeBlock language="bash" code={code} />
              <Prose>
                <p>
                  Reboot, then confirm it worked with <InlineCode>dmesg | grep -e DMAR -e IOMMU</InlineCode>. If you see
                  your GPU in its own IOMMU group, you are ready to add it to the VM.
                </p>
              </Prose>
            </ChatMessage>
            <ChatMessage role="user">It's an AMD board. Does that change anything?</ChatMessage>
            <ChatMessage role="assistant">
              <Prose>
                <p>
                  Only the kernel flag. On AMD the IOMMU driver turns on by itself once it is enabled in the BIOS, so
                  drop <InlineCode>intel_iommu=on</InlineCode> and keep <InlineCode>iommu=pt</InlineCode> for better
                  host performance.
                </p>
              </Prose>
              <TypingIndicator />
            </ChatMessage>
          </ChatThread>

          <div className="px-6 pt-3 pb-5">
            <PromptInput
              value={draft}
              onValueChange={setDraft}
              onSubmit={() => setDraft("")}
              placeholder="Ask a follow-up…"
              onAttach={() => {}}
              tools={
                <>
                  <PromptInputChip active={web} onClick={() => setWeb(!web)}>
                    <GlobeIcon />
                    Web
                  </PromptInputChip>
                  <PromptInputChip active={notes} onClick={() => setNotes(!notes)}>
                    <NotebookIcon />
                    homelab notes
                  </PromptInputChip>
                </>
              }
              footer="Runs on your machine. Answers can be wrong, so check anything important."
            />
          </div>
        </Card>
      </main>
    </div>
  )
}
