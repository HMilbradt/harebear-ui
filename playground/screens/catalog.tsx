import { CheckIcon, FileTextIcon, ImageIcon, SearchIcon, TerminalIcon, XIcon } from "lucide-react"
import { useState } from "react"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  Bubble,
  BubbleContent,
  BubbleGroup,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
  CodeSnippet,
  Celebration,
  celebrate,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  DateTimePicker,
  type DateTimeValue,
  DetailSheet,
  Field,
  FieldLabel,
  Input,
  MarkdownEditor,
  Marker,
  MarkerContent,
  MarkerIcon,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  NativeSelect,
  NativeSelectOption,
  PageHeader,
  PasswordInput,
  Prose,
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ThemeToggle,
  Trace,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/index"

const frameworks = ["Next.js", "Remix", "Astro", "Vite", "TanStack Start", "React Router"]

const tsx = `export function Greeting({ name }: { name: string }) {
  const [count, setCount] = useState(0)
  return <Button onClick={() => setCount(count + 1)}>Hi {name} ({count})</Button>
}`

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}

// Tiny stand-in for react-markdown: headings, "> " quotes, paragraphs.
function previewMarkdown(md: string) {
  return md.split(/\n{2,}/).map((block, i) => {
    const key = `${i}-${block.slice(0, 8)}`
    if (block.startsWith("# ")) return <h1 key={key}>{block.slice(2)}</h1>
    if (block.startsWith("> "))
      return (
        <blockquote key={key}>
          <p>{block.slice(2)}</p>
        </blockquote>
      )
    return <p key={key}>{block}</p>
  })
}

function NewFormControls() {
  const [when, setWhen] = useState<DateTimeValue | null>({ date: "2026-11-12", time: "09:30" })
  const [body, setBody] = useState(
    "# Furnace filter\n\nSwap it every three months.\n\n> Tip: Turn the power off first.",
  )
  const [details, setDetails] = useState(false)
  return (
    <>
      <Section title="Forms" description="PasswordInput, DateTimePicker and MarkdownEditor.">
        <Field>
          <FieldLabel htmlFor="c-password">Password</FieldLabel>
          <PasswordInput id="c-password" defaultValue="correct horse" />
        </Field>
        <Field>
          <FieldLabel htmlFor="c-when">When</FieldLabel>
          <DateTimePicker id="c-when" withTime value={when} onChange={setWhen} />
        </Field>
        <Field>
          <FieldLabel htmlFor="c-body">Body</FieldLabel>
          <MarkdownEditor id="c-body" value={body} onChange={setBody} renderPreview={previewMarkdown} />
        </Field>
      </Section>
      <Section title="Details and joy" description="DetailSheet, Prose tips and Celebration.">
        <Prose>
          {previewMarkdown("> Tip: A blockquote starting with Tip: is a Callout.\n\n> A plain quote stays a quote.")}
        </Prose>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setDetails(true)}>
            Open details
          </Button>
          <Button variant="outline" onClick={() => celebrate()}>
            Celebrate
          </Button>
        </div>
        <DetailSheet
          open={details}
          onOpenChange={setDetails}
          title="To-do"
          footer={
            <Button variant="ghost" onClick={() => setDetails(false)}>
              Delete
            </Button>
          }
        >
          <Field>
            <FieldLabel htmlFor="c-sheet-when">When</FieldLabel>
            <DateTimePicker id="c-sheet-when" value={when} onChange={setWhen} />
          </Field>
        </DetailSheet>
        <Celebration />
      </Section>
    </>
  )
}

export function CatalogScreen() {
  return (
    <div className="mx-auto flex max-w-300 flex-col gap-7 px-4 pt-10 pb-16 md:px-8">
      <PageHeader
        title="New in 0.2"
        description="shadcn components added to complete the catalog."
        actions={<ThemeToggle />}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Message + Bubble" description="Message layout with bubble variants.">
          <MessageGroup>
            <Message align="end">
              <MessageContent>
                <Bubble align="end" variant="muted">
                  <BubbleContent>Can you summarize last week's incidents?</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
            <Message>
              <MessageAvatar className="size-8 bg-primary-soft text-xs font-semibold text-primary">AI</MessageAvatar>
              <MessageContent>
                <BubbleGroup>
                  <Bubble variant="secondary">
                    <BubbleContent>Two incidents, both resolved within an hour.</BubbleContent>
                  </Bubble>
                  <Bubble variant="tinted">
                    <BubbleContent>The NAS pool alert was a false positive.</BubbleContent>
                  </Bubble>
                </BubbleGroup>
              </MessageContent>
            </Message>
            <Message>
              <MessageContent>
                <Marker variant="separator">
                  <MarkerContent>Today</MarkerContent>
                </Marker>
              </MessageContent>
            </Message>
            <Message align="end">
              <MessageContent>
                <Bubble align="end">
                  <BubbleContent>Thanks!</BubbleContent>
                </Bubble>
                <MessageFooter>Read 9:41</MessageFooter>
              </MessageContent>
            </Message>
          </MessageGroup>
        </Section>

        <Section title="Trace + Marker" description="Agent steps and inline status.">
          <Trace>
            <TraceLine>
              <TraceIcon>
                <SearchIcon />
              </TraceIcon>
              <TraceTitle>Searched the web</TraceTitle>
              <TraceDescription>4 results</TraceDescription>
            </TraceLine>
            <TraceLine>
              <TraceIcon>
                <FileTextIcon />
              </TraceIcon>
              <TraceTitle>Read 2 notes</TraceTitle>
              <TraceDescription>homelab/</TraceDescription>
            </TraceLine>
            <TraceLine status="running">
              <TraceIcon>
                <TerminalIcon />
              </TraceIcon>
              <TraceTitle>Running zpool status</TraceTitle>
            </TraceLine>
            <TraceLine status="error">
              <TraceIcon>
                <XIcon />
              </TraceIcon>
              <TraceTitle>SSH to nas.lan failed</TraceTitle>
            </TraceLine>
          </Trace>
          <Marker>
            <MarkerIcon>
              <CheckIcon />
            </MarkerIcon>
            <MarkerContent>Conversation saved</MarkerContent>
          </Marker>
        </Section>

        <Section title="Attachment" description="Files on a message or composer.">
          <AttachmentGroup>
            <Attachment>
              <AttachmentMedia>
                <FileTextIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>q3-report.pdf</AttachmentTitle>
                <AttachmentDescription>2.4 MB</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Remove">
                  <XIcon />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
            <Attachment>
              <AttachmentMedia>
                <ImageIcon />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>diagram.png</AttachmentTitle>
                <AttachmentDescription>812 KB</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          </AttachmentGroup>
        </Section>

        <Section title="Questionnaire" description="Step-by-step choices, e.g. an agent asking clarifying questions.">
          <Questionnaire items={[{ name: "scope", required: true }, { name: "notify" }]}>
            <QuestionnaireProgress />
            <QuestionnaireItem name="scope" required>
              <QuestionnaireTitle>Which hosts should the check cover?</QuestionnaireTitle>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="all">All hosts</QuestionnaireChoice>
                <QuestionnaireChoice value="prod">Only production</QuestionnaireChoice>
                <QuestionnaireChoice value="nas">Only the NAS</QuestionnaireChoice>
              </QuestionnaireChoices>
            </QuestionnaireItem>
            <QuestionnaireItem name="notify" multiple>
              <QuestionnaireTitle>Where should results go?</QuestionnaireTitle>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="email">Email</QuestionnaireChoice>
                <QuestionnaireChoice value="slack">Slack</QuestionnaireChoice>
              </QuestionnaireChoices>
            </QuestionnaireItem>
            <QuestionnaireActions>
              <QuestionnaireNext />
              <QuestionnaireSubmit />
            </QuestionnaireActions>
          </Questionnaire>
        </Section>

        <Section title="Code" description="CodeSnippet (one prop, highlighted) and CodeBlock parts (diff lines).">
          <CodeSnippet language="tsx" code={tsx} />
          <CodeBlock>
            <CodeBlockContent lineNumbers>
              <CodeBlockLine>{'GRUB_CMDLINE_LINUX_DEFAULT="quiet"'}</CodeBlockLine>
              <CodeBlockLine variant="removed">{"  intel_iommu=on iommu=pt"}</CodeBlockLine>
              <CodeBlockLine variant="added">{"  amd_iommu=on iommu=pt"}</CodeBlockLine>
            </CodeBlockContent>
          </CodeBlock>
        </Section>

        <Section title="Form controls" description="Input, Select, NativeSelect and Combobox share one look.">
          <Field>
            <FieldLabel htmlFor="c-name">Name</FieldLabel>
            <Input id="c-name" placeholder="Beast" />
          </Field>
          <Field>
            <FieldLabel>Region (Select)</FieldLabel>
            <Select defaultValue="yvr">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yvr">Vancouver</SelectItem>
                <SelectItem value="yyz">Toronto</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="c-native">Plan (NativeSelect)</FieldLabel>
            <NativeSelect id="c-native" defaultValue="pro">
              <NativeSelectOption value="starter">Starter</NativeSelectOption>
              <NativeSelectOption value="pro">Pro</NativeSelectOption>
              <NativeSelectOption value="scale">Scale</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel>Framework (Combobox)</FieldLabel>
            <Combobox items={frameworks}>
              <ComboboxInput placeholder="Pick a framework" />
              <ComboboxContent>
                <ComboboxEmpty>No matches.</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        </Section>

        <NewFormControls />
      </div>
    </div>
  )
}
