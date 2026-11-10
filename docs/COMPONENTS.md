# harebear-ui component catalog

Every export, what it is for, and the props that matter. All components import from the package root:

```tsx
import { Button, Card, DataTable, ChatMessage } from "harebear-ui"
```

Full working screens that combine these live in the repo under `playground/screens/` (admin dashboard, AI chat, data table with detail panel, status home page). Copy from them.

## Rules of thumb

- **shadcn-compatible.** Primitives keep shadcn/ui names, parts, and props. If you know shadcn, you know these. Only the styling (and a few added variants) differ.
- **Style with tokens, not colors.** Use `bg-card`, `text-muted-foreground`, `bg-primary-soft`, `text-success`, `shadow-card`, `rounded-xl`. Never hard-code hex values or Tailwind palette colors (`bg-blue-500`). See [Tokens](#tokens).
- **Compose, don't fork.** Every component accepts `className` (merged with `cn`, later classes win). Reach for a primitive before writing a new component.
- **Icons are lucide-react elements.** Pass `<SearchIcon />`, not the component. Buttons size icons automatically.
- **Status uses tones**, not colors: `"success" | "warning" | "danger" | "info" | "neutral"`.

## Theme

| Export          | Use                                                                                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ThemeProvider` | Wrap the app once. Props: `defaultMode` (`"light" \| "dark" \| "system"`, default `"system"`), `accent` (CSS color, drives primary), `radius` (px, default 14), `font` (family name; Geist is bundled), `storageKey` (default `"harebear-theme"`, `null` disables persistence). |
| `useTheme`      | `{ mode, resolvedMode, setMode, toggleMode, accent, setAccent, radius, setRadius }`. Safe outside a provider.                                                                                                                                                                   |
| `ThemeToggle`   | Ghost icon button that flips light/dark. Accepts Button props.                                                                                                                                                                                                                  |
| `ThemeScript`   | For SSR (Next.js, Remix): render in `<head>` to set `.dark` before paint and avoid a flash. Props: `storageKey`, `defaultMode`.                                                                                                                                                 |

```tsx
;<ThemeProvider accent="#2F5BD3" radius={14}>
  <TooltipProvider>
    <App />
    <Toaster />
  </TooltipProvider>
</ThemeProvider>
```

## Primitives (shadcn/ui, restyled)

These are the shadcn/ui `radix-nova` components, restyled to the harebear tokens. API docs: https://ui.shadcn.com/docs/components. harebear-specific changes are noted.

| Family          | Exports                                                                                                                                                                                                                                                                                                                                                                                                                                                      | harebear notes                                                                                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion       | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`                                                                                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                     |
| Alert           | `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                     |
| Alert dialog    | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogMedia`, `AlertDialogOverlay`, `AlertDialogPortal`                                                                                                                                                                                                   | Use for destructive confirmations.                                                                                                                                                                                                                                  |
| Aspect ratio    | `AspectRatio`                                                                                                                                                                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                                                                                     |
| Avatar          | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge`                                                                                                                                                                                                                                                                                                                                                                  | `size`: `sm` 28px, `default` 36px, `lg` 56px. Fallback is tinted initials.                                                                                                                                                                                          |
| Badge           | `Badge`, `badgeVariants`                                                                                                                                                                                                                                                                                                                                                                                                                                     | 24px pill. `variant`: `default` (primary), `secondary` (neutral, the common one), `soft` (tinted primary), `outline`, `success`, `warning`, `destructive`, `ghost`, `link`.                                                                                         |
| Breadcrumb      | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`                                                                                                                                                                                                                                                                                                                            |                                                                                                                                                                                                                                                                     |
| Button          | `Button`, `buttonVariants`                                                                                                                                                                                                                                                                                                                                                                                                                                   | 40px default. `variant`: `default`, `secondary`, `outline`, `ghost`, `soft`, `dashed`, `destructive`, `link`. `size`: `xs`, `sm` (32px), `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`. `shape`: `default`, `pill`. Icon-only buttons need `aria-label`. |
| Button group    | `ButtonGroup`, `ButtonGroupSeparator`, `ButtonGroupText`, `buttonGroupVariants`                                                                                                                                                                                                                                                                                                                                                                              |                                                                                                                                                                                                                                                                     |
| Calendar        | `Calendar`, `CalendarDayButton`                                                                                                                                                                                                                                                                                                                                                                                                                              | react-day-picker v10. Combine with `Popover` for a date picker.                                                                                                                                                                                                     |
| Card            | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`                                                                                                                                                                                                                                                                                                                                                              | Bordered, elevated (`shadow-card`), `rounded-xl`, 24px padding. `size="sm"` for 16px. `CardAction` puts a control top-right of the header.                                                                                                                          |
| Carousel        | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `useCarousel`, type `CarouselApi`                                                                                                                                                                                                                                                                                                                                         | embla.                                                                                                                                                                                                                                                              |
| Chart           | `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`                                                                                                                                                                                                                                                                                                                                                   | Recharts wrappers. Prefer `TrendChart` for line/area; use these for custom charts.                                                                                                                                                                                  |
| Checkbox        | `Checkbox`                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                     |
| Collapsible     | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                     |
| Command         | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`                                                                                                                                                                                                                                                                                                              | Use for ⌘K palettes.                                                                                                                                                                                                                                                |
| Context menu    | `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuRadioGroup`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`                                                                                                                     |                                                                                                                                                                                                                                                                     |
| Dialog          | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal`                                                                                                                                                                                                                                                                                               |                                                                                                                                                                                                                                                                     |
| Drawer          | `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`, `DrawerOverlay`, `DrawerPortal`                                                                                                                                                                                                                                                                                               | vaul. Mobile bottom sheets.                                                                                                                                                                                                                                         |
| Dropdown menu   | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`                                                                                                      |                                                                                                                                                                                                                                                                     |
| Empty state     | `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`                                                                                                                                                                                                                                                                                                                                                                       | Use for zero-data screens.                                                                                                                                                                                                                                          |
| Field           | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle`                                                                                                                                                                                                                                                                                                             | Form layout. Works with react-hook-form or plain state.                                                                                                                                                                                                             |
| Hover card      | `HoverCard`, `HoverCardTrigger`, `HoverCardContent`                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                                                                                                                                                                                                     |
| Input           | `Input`                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 40px, filled `bg-muted`, turns `bg-card` with a primary ring on focus.                                                                                                                                                                                              |
| Input group     | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`                                                                                                                                                                                                                                                                                                                                               | Inputs with icons, prefixes, buttons.                                                                                                                                                                                                                               |
| Input OTP       | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`                                                                                                                                                                                                                                                                                                                                                                                             |                                                                                                                                                                                                                                                                     |
| Item            | `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemGroup`, `ItemSeparator`, `ItemHeader`, `ItemFooter`                                                                                                                                                                                                                                                                                                                  | Generic list rows.                                                                                                                                                                                                                                                  |
| Kbd             | `Kbd`, `KbdGroup`                                                                                                                                                                                                                                                                                                                                                                                                                                            | Mono keycap.                                                                                                                                                                                                                                                        |
| Label           | `Label`                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                                                                                                                                                                                                                                                                     |
| Menubar         | `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarLabel`, `MenubarSeparator`, `MenubarShortcut`, `MenubarGroup`, `MenubarPortal`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`                                                                                                                                                                  |                                                                                                                                                                                                                                                                     |
| Navigation menu | `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`, `navigationMenuTriggerStyle`                                                                                                                                                                                                                                      | Marketing-style top nav.                                                                                                                                                                                                                                            |
| Pagination      | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`                                                                                                                                                                                                                                                                                                                          | `DataTable` has its own pager.                                                                                                                                                                                                                                      |
| Popover         | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                     |
| Progress        | `Progress`                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 8px rounded meter. `UsageMeter` adds a label row.                                                                                                                                                                                                                   |
| Radio group     | `RadioGroup`, `RadioGroupItem`                                                                                                                                                                                                                                                                                                                                                                                                                               |                                                                                                                                                                                                                                                                     |
| Resizable       | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`                                                                                                                                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                     |
| Scroll area     | `ScrollArea`, `ScrollBar`                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                     |
| Select          | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                     |
| Separator       | `Separator`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                                                                                                                                                                     |
| Sheet           | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`                                                                                                                                                                                                                                                                                                                                        | Side panels.                                                                                                                                                                                                                                                        |
| Sidebar         | `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarInput`, `SidebarInset`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `useSidebar` | Active item is a raised card. Prefer `AppShell` unless you need a custom layout.                                                                                                                                                                                    |
| Skeleton        | `Skeleton`                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Loading placeholders.                                                                                                                                                                                                                                               |
| Slider          | `Slider`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                     |
| Spinner         | `Spinner`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                     |
| Switch          | `Switch`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                     |
| Table           | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`                                                                                                                                                                                                                                                                                                                                                     | Borderless rows with rounded hover; quiet 12px headers. `data-state="selected"` tints a row.                                                                                                                                                                        |
| Tabs            | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants`                                                                                                                                                                                                                                                                                                                                                                                         | `TabsList variant`: `default` (segmented control), `pill` (rounded top-level nav), `line`. Use `Tabs` as a segmented filter too (date ranges, status filters).                                                                                                      |
| Textarea        | `Textarea`                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Same filled style as `Input`, auto-grows.                                                                                                                                                                                                                           |
| Toast           | `Toaster`                                                                                                                                                                                                                                                                                                                                                                                                                                                    | sonner. Mount once; call `toast("Saved")` from `sonner`. Follows the theme mode.                                                                                                                                                                                    |
| Toggle          | `Toggle`, `toggleVariants`, `ToggleGroup`, `ToggleGroupItem`                                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                                                                                                                                                                                                     |
| Tooltip         | `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`                                                                                                                                                                                                                                                                                                                                                                                             | Mount `TooltipProvider` once near the root.                                                                                                                                                                                                                         |

## Admin and layout

### `AppShell`

Full app layout: collapsible sidebar (a sheet on mobile) plus a main column with a top bar.

Props: `brand` (node, usually `AppBrand`), `nav: AppNavSection[]`, `sidebarExtra` (node under the nav), `sidebarFooter` (node, usually `UserChip`), `header` (top bar content), `linkComponent` (e.g. Next.js `Link`; default `"a"`), `defaultOpen`, `children` (page content, laid out in a column with 28px gaps).

`AppNavSection = { label?: string; items: AppNavItem[] }`
`AppNavItem = { label: string; icon?: ReactNode; href?: string; onSelect?: () => void; active?: boolean; badge?: ReactNode }`

```tsx
;<AppShell
  brand={<AppBrand name="Console" subtitle="Personal workspace" icon={<SparklesIcon />} />}
  nav={[
    {
      label: "Workspace",
      items: [
        { label: "Overview", icon: <LayoutDashboardIcon />, href: "/", active: true },
        { label: "Orders", icon: <ShoppingBagIcon />, href: "/orders", badge: 12 },
      ],
    },
  ]}
  sidebarFooter={<UserChip name="Harrison M" subtitle="Owner" />}
  header={
    <>
      <SearchInput placeholder="Search anything" shortcut="⌘K" wrapperClassName="flex-[0_1_380px]" />
      <div className="flex-1" />
      <ThemeToggle />
    </>
  }
  linkComponent={Link}
>
  <PageHeader title="Overview" description="Last 30 days." actions={<Button>New report</Button>} />
  ...
</AppShell>
```

### `AppBrand`

Logo tile + name. Props: `name`, `subtitle?`, `icon?`, `action?` (trailing control).

### `PageHeader`

Title row. Props: `title`, `description?`, `count?` (badge after title), `eyebrow?` (small text above), `actions?` (right side, wraps on mobile).

### `StatCard`

KPI tile. Props: `label`, `value`, `delta?` ("12.4%"), `trend?` (`"up" | "down"`, default up), `positive?` (good/bad color; defaults to `trend === "up"`, so set `positive` for "latency went down"), `note?` ("vs last month"), `icon?`, `data?: number[]` (sparkline).

```tsx
;<div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
  <StatCard
    label="Revenue"
    value="$48,210"
    delta="12.4%"
    note="vs last month"
    icon={<DollarSignIcon />}
    data={revenue}
  />
  <StatCard label="Avg. response" value="182 ms" delta="18 ms" trend="down" positive note="faster" icon={<ZapIcon />} />
</div>
```

### `SearchInput`

Search field with icon. Props: all `<input>` props, `shortcut?` (display-only key hint like `"⌘K"`), `size?` (`"default"` or `"lg"` hero pill), `wrapperClassName?` (size/flex the wrapper).

### `StatusDot`, `StatusBadge`

Dot or pill for status. Prop `tone`: `success | warning | danger | info | neutral`. `StatusBadge` takes Badge props (`variant="outline"` for a white pill).

### `UsageMeter`

Label + value over a bar. Props: `label`, `percent` (0-100, clamped), `value?` (bold), `detail?` (muted), `color?` (CSS color, e.g. `"var(--warning)"`), `trackClassName?`.

### `ActivityFeed`

Props: `items: { actor; action; target?; time; avatarUrl?; id? }[]`. Renders "**Maya** commented on **Q4 roadmap**".

### `Timeline`

Vertical events with a rail. Props: `items: { title; time; tone?; id? }[]`.

### `KeyValueGrid`

Label-over-value pairs as a `<dl>`. Props: `items: { label; value }[]`, `columns?: 1 | 2 | 3`.

### `UserChip`

Avatar + name + subtitle. Props: `name`, `subtitle?`, `avatarUrl?`, `action?`, `size?`. Also exports `initials(name)`.

### `Callout`

Quiet note with an icon (sparkle by default). Props: `icon?`, `tone?` (`"muted" | "soft"`).

### `LinkTile`

Muted tile that lifts on hover, for service launchers. Props: `title`, `subtitle?` (mono), `icon?`, `status?: { tone; label }`, `href`, or `asChild` with your router `<Link>` as the only child.

## Data display

### `DataTable`

Client-side table with search, sorting, row selection, pagination (TanStack Table v9).

Props: `columns`, `data`, `getRowId?` (needed for selection/active row), `searchable?`, `searchPlaceholder?`, `toolbar?` (controls after the search box), `selectable?`, `onSelectionChange?(rows)`, `onRowClick?(row)`, `activeRowId?` (highlight the row open in a detail panel), `pageSize?` (default 10, `0` = no pagination), `emptyMessage?`.

Define columns with the typed helper, at module scope (stable references matter):

```tsx
import { createDataTableColumnHelper, DataTable, StatusBadge } from "harebear-ui"

type Customer = { id: string; name: string; status: "Active" | "Trial"; mrr: number }
const col = createDataTableColumnHelper<Customer>()
const columns = col.columns([
  col.accessor("name", { header: "Name" }),
  col.accessor("status", { header: "Status", cell: ({ getValue }) => <StatusBadge tone="success">{getValue()}</StatusBadge> }),
  col.accessor("mrr", { header: "MRR", meta: { align: "right" }, cell: ({ getValue }) => `$${getValue()}` }),
])

<DataTable columns={columns} data={customers} getRowId={(r) => r.id} searchable selectable onRowClick={open} />
```

`meta: { align: "right" }` right-aligns a column. `enableSorting: false` turns sorting off for one column. For server-side data, build with `useTable` from `@tanstack/react-table` and the `Table` primitives; `dataTableFeatures` is exported if you want the same feature set.

Related exports: `createDataTableColumnHelper`, `dataTableFeatures`, types `DataTableColumnDef`, `DataTableFeatures`, `DataTableProps`.

### `TrendChart`, `TrendLegend`

Smoothed area chart with grid, axes and tooltip. Props: `data` (rows), `xKey`, `series: { key; label; color?; dashed? }[]` (dashed = comparison line, no fill), `height?` (default 240), `valueFormatter?`, `xFormatter?`, `hideYAxis?`. Colors default to `chart-1..5`. `TrendLegend` takes the same `series` and renders a matching legend (put it in `CardAction`).

### `BarList`

Ranked bars. Props: `items: { label; percent; value?; color? }[]`.

### `Sparkline`

Tiny trend line. Props: `data: number[]`, `color?`, `area?` (fill, default true), `min?`, `max?`. Size with `className` (default `h-9 w-full`). Also exports `smoothPath(points)`.

### `StatusBars`

Mini bar history (pings, uptime). Props: `data: (number | { value; tone?; label? })[]`, `max?`, `tone?` (default for plain numbers). Default size 96x26.

## AI and chat

A chat screen is: `ConversationList` in a sidebar, a `Card` with a header (`ModelPicker`), a `ChatThread` of `ChatMessage`s, and a `PromptInput` at the bottom. See `playground/screens/chat.tsx`.

### `ChatThread`

Scrollable log that sticks to the bottom as content streams in (unless the user scrolls up). Give it a bounded height (e.g. `flex-1` inside a fixed-height column). Props: `autoScroll?` (default true), `contentClassName?` (inner column, max-width 760px).

### `ChatMessage`

One turn. Props: `role: "user" | "assistant"` (matches AI SDK message roles), `avatar?` (assistant only, defaults to `AssistantAvatar`), `actions?` (assistant only, under the content), `children`.
User turns render as a right-aligned bubble with preserved newlines. Assistant turns render free-flowing: put `Prose`, `CodeBlock`, `ToolCall`, `TypingIndicator` inside.

```tsx
;<ChatThread>
  {messages.map((m) => (
    <ChatMessage
      key={m.id}
      role={m.role}
      actions={m.role === "assistant" ? <MessageActions copyText={m.text} onRegenerate={regen} /> : undefined}
    >
      {m.role === "user" ? (
        m.text
      ) : (
        <Prose>
          <Markdown>{m.text}</Markdown>
        </Prose>
      )}
    </ChatMessage>
  ))}
  {status === "streaming" && (
    <ChatMessage role="assistant">
      <TypingIndicator />
    </ChatMessage>
  )}
</ChatThread>
```

### `AssistantAvatar`

Tinted circle icon. Props: `icon?`, `className?`.

### `MessageActions`

Row of ghost icon buttons. Props: `copyText?` (shows copy), `onRegenerate?`, `onFeedback?(up|down)`, `feedback?` (pressed state), `children` (extra buttons).

### `PromptInput`, `PromptInputChip`

Composer. Props: `value`, `onValueChange`, `onSubmit(text)` (Enter sends trimmed text, Shift+Enter is a newline), `placeholder?`, `loading?` + `onStop?` (send becomes stop), `onAttach?` (shows paperclip), `tools?` (chips), `footer?` (disclaimer), `disabled?`, `autoFocus?`.
`PromptInputChip` is a pill toggle for the tools slot: `active`, `onClick`, children (icon + label).

### `ModelPicker`

Pill showing the active model with a status dot, opening a menu. Props: `models: { id; label?; description?; status? }[]`, `value`, `onValueChange`, `label?`, `disabled?`.

### `ConversationList`

Grouped thread list. Props: `groups: { label; items: { id; title }[] }[]`, `activeId?`, `onSelect?(id)`.

### `ToolCall`

Outlined chip for a tool call. Props: `status?` (`running` shows a spinner, `done`, `error`), `icon?`, `children` (summary).

### `TypingIndicator`

Three pulsing dots.

### `CodeBlock`, `InlineCode`, `Prose`

`CodeBlock`: `code`, `language?`, `hideCopy?`, `children?` (pre-highlighted markup, e.g. from shiki; no highlighter bundled).
`InlineCode`: monospace span.
`Prose`: typography for model output and markdown. Styles plain `p, ul, ol, li, strong, a, code, pre, h1-h4, blockquote, table` children, so it works with `react-markdown`.

## Hooks and utilities

| Export                         | Use                                                           |
| ------------------------------ | ------------------------------------------------------------- |
| `useCopyToClipboard(resetMs?)` | `{ copied, copy(text) }` for copy buttons.                    |
| `useIsMobile()`                | `true` under 768px.                                           |
| `cn(...classes)`               | clsx + tailwind-merge. Use for every `className` you compose. |

## Tokens

Use these as Tailwind utilities (`bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, `stroke-*`):

| Token                               | Use                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `background` / `foreground`         | Page background and body text.                                                                    |
| `card` / `card-foreground`          | Raised surfaces (cards, active nav item, popovers via `popover`).                                 |
| `muted` / `muted-foreground`        | Inputs, segmented controls, quiet panels; secondary text and labels.                              |
| `primary` / `primary-foreground`    | Brand accent (from `--brand`). Primary buttons, links, chart line.                                |
| `primary-soft`                      | Tinted primary background for selected rows, soft badges, icon circles. Pair with `text-primary`. |
| `secondary`, `accent`               | Same as muted; kept for shadcn compatibility.                                                     |
| `success`, `warning`, `destructive` | Status colors. Use `bg-success/12 text-success` for soft status fills.                            |
| `border`, `input`, `ring`           | Hairlines, input borders, focus rings.                                                            |
| `chart-1` … `chart-5`, `chart-grid` | Data series and gridlines.                                                                        |
| `sidebar-*`                         | Sidebar surfaces (default to the page tokens).                                                    |

Other theme values: `rounded-sm/md/lg/xl/2xl` scale from `--radius` (default 14px; cards use `xl`, buttons and inputs `md`), `shadow-card` (the one elevation), `font-sans` (Geist), `font-mono` (Geist Mono), `animate-typing`.

Override any token in your CSS after the import:

```css
@import "tailwindcss";
@import "harebear-ui/styles.css";

:root {
  --brand: #0f8a7e;
  --radius: 0.625rem;
}
.dark {
  --background: #0b0b0d;
}
```
