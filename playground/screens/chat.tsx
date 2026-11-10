import {
  EllipsisIcon,
  FileTextIcon,
  GlobeIcon,
  NotebookIcon,
  SettingsIcon,
  ShareIcon,
  SquarePenIcon,
} from "lucide-react"
import { useState } from "react"
import {
  AppBrand,
  Button,
  ChatPanel,
  ChatShell,
  ChatMessage,
  CodeSnippet,
  ConversationList,
  InlineCode,
  Kbd,
  MessageActions,
  NewConversationButton,
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
    <ChatShell
      brand={<AppBrand name="Assistant" icon={<NotebookIcon />} />}
      sidebarActions={
        <>
          <NewConversationButton label="New chat" icon={<SquarePenIcon />} shortcut={<Kbd>⌘N</Kbd>} />
          <SearchInput placeholder="Search chats" aria-label="Search chats" />
        </>
      }
      sidebar={<ConversationList groups={groups} activeId={active} onSelect={setActive} />}
      sidebarFooter={
        <UserChip
          name="Harrison M"
          subtitle="Local · Ollama"
          action={
            <Button variant="ghost" size="icon" aria-label="Settings">
              <SettingsIcon />
            </Button>
          }
        />
      }
    >
      <ChatPanel
        title={title}
        description="4 messages · started 14 min ago"
        conversationId={active}
        actions={
          <>
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
          </>
        }
        composer={
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
        }
      >
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
          <CodeSnippet language="bash" code={code} />
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
              Only the kernel flag. On AMD the IOMMU driver turns on by itself once it is enabled in the BIOS, so drop{" "}
              <InlineCode>intel_iommu=on</InlineCode> and keep <InlineCode>iommu=pt</InlineCode> for better host
              performance.
            </p>
          </Prose>
          <TypingIndicator />
        </ChatMessage>
      </ChatPanel>
    </ChatShell>
  )
}
