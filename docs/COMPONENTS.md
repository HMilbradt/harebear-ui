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
- **Touch targets are built in.** Under `pointer: coarse`, `Button` (every size) and `Toggle`/`ToggleGroupItem` get a 44px hit area (an invisible `::after`, which an `overflow-hidden` ancestor or a later sibling clips: in such a spot, size the button itself, e.g. `pointer-coarse:size-11`, as the `CodeBlock` and `CodeSnippet` copy buttons do) and `Input`/`InputGroup` grow to 44px.

## Agent-first apps

A household or personal app where an assistant sits on every page and safe actions run on their own, with Undo.

```tsx
<ThemeProvider>
  <TooltipProvider>
    <AssistantProvider onSend={(text, { page, append }) => runAgent(text, page, append)}>
      <AppNav
        brand={<AppBrand name="Homeclub" icon={<HouseIcon />} />}
        places={[{ label: "Today", icon: <SunIcon />, href: "/", active: true, count: 3 }, ...]}
        group={{ label: "Lists", href: "/lists", items: lists, onAdd: newList, addLabel: "New list" }}
        action={{ label: "New to-do", icon: <PlusIcon />, onSelect: openQuickAdd }}
        footer={<UserMenu name={user.name} onSignOut={signOut} />}
      >
        <Outlet /> {/* pages call useAssistantPage({ id, title, suggestions }) */}
        <AssistantDock title="HomeBot" fullScreenHref="/chat" />
      </AppNav>
      <Toaster />
    </AssistantProvider>
  </TooltipProvider>
</ThemeProvider>
```

- Pages: `Page` (the column) with a `PageHeader` (h1; `UserMenu compact className="md:hidden"` in `actions`, hidden from md up, since the sidebar footer is hidden on phones) and `PageSection`s (h2 regions). A chat page sets `fill` on `AppNav`.
- Lists: `SectionedList` (`TaskRow` rows); when the agent or a bulk action changes data, confirm with `toastUndo` and set `lingerMs` to its window so a ticked row stays struck through for about as long as Undo shows.
- A week agenda: `DayStrip sticky` above one `SectionedList` with a section per day (`empty` keeps empty days) and `AgendaRow` rows from `renderItem`.
- A record's details (`DetailSheet`): `ChecklistEditor` for steps, `CommentThread` for comments, `MarkdownEditor` for notes.
- In the assistant thread, each action it took is an `ActionReceipt` with Undo (append it from `onSend`).
- A page with its own ask box (Today) answers under it: `AskBox` with `reply` and `pending` from `useAssistant()`, `onStop={stop}`, and `send(text, { open: false })`.
- Settings open over any page in a `SettingsDialog` (a section per topic, each one or more `SettingsSection`s of `SettingsRow`s); setup flows leave the frame in a `FocusLayout`.
- Members, lists and calendars take a `category-1..6` color (`CategoryColor`); status colors never double as categories. People are `MemberAvatar` (`AvatarStack`, `VisibilityBadge`), list dots are `CategoryDot`, profile settings use `AvatarUpload` and `ColorSwatchPicker`.
- Live example: `playground/screens/household.tsx` (`#household`) and `settings.tsx` (`#settings`).

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

Every component in the shadcn registry is included. (shadcn's `form` item is an empty placeholder in the `radix-nova` style; use `Field`.) These are the shadcn/ui `radix-nova` components, restyled to the harebear tokens. API docs: https://ui.shadcn.com/docs/components. harebear-specific changes are noted.

| Family           | Exports                                                                                                                                                                                                                                                                                                                                                                                                                                                      | harebear notes                                                                                                                                                                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accordion        | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`                                                                                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                           |
| Alert            | `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`                                                                                                                                                                                                                                                                                                                                                                                                     | harebear adds `variant` `warning`, `success`, `info` (tinted, borderless). Descriptions wrap long words.                                                                                                                                                                                                                                                                  |
| Alert dialog     | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogMedia`, `AlertDialogOverlay`, `AlertDialogPortal`                                                                                                                                                                                                   | Use for destructive confirmations.                                                                                                                                                                                                                                                                                                                                        |
| Aspect ratio     | `AspectRatio`                                                                                                                                                                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                           |
| Attachment       | `Attachment`, `AttachmentGroup`, `AttachmentMedia`, `AttachmentContent`, `AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`, `AttachmentAction`, `AttachmentTrigger`                                                                                                                                                                                                                                                                            | File/image chips on messages and composers. `size`: `default`, `sm`, `xs`; `orientation`: `horizontal`, `vertical`.                                                                                                                                                                                                                                                       |
| Avatar           | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount`, `AvatarBadge`                                                                                                                                                                                                                                                                                                                                                                  | `size`: `sm` 28px, `default` 36px, `lg` 56px. Fallback is tinted initials, 12px at `sm`. For people use `MemberAvatar`.                                                                                                                                                                                                                                                   |
| Badge            | `Badge`, `badgeVariants`                                                                                                                                                                                                                                                                                                                                                                                                                                     | 24px pill. `variant`: `default` (primary), `secondary` (neutral, the common one), `soft` (tinted primary), `outline`, `success`, `warning`, `destructive`, `ghost`, `link`. harebear adds `size="lg"` (32px, lines up with sm buttons) and `tone` (`success \| warning \| danger \| info \| neutral`, the StatusBadge words; wins over `variant`).                        |
| Bubble           | `Bubble`, `BubbleGroup`, `BubbleContent`, `BubbleReactions`                                                                                                                                                                                                                                                                                                                                                                                                  | Chat bubble. `variant`: `default` (primary), `secondary`, `muted`, `tinted`, `outline`, `ghost`, `destructive`; `align`: `start`, `end`.                                                                                                                                                                                                                                  |
| Breadcrumb       | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`                                                                                                                                                                                                                                                                                                                            |                                                                                                                                                                                                                                                                                                                                                                           |
| Button           | `Button`, `buttonVariants`                                                                                                                                                                                                                                                                                                                                                                                                                                   | 40px default. `variant`: `default`, `secondary`, `outline`, `ghost`, `soft`, `dashed`, `destructive`, `link`. `size`: `xs`, `sm` (32px), `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`. `shape`: `default`, `pill`. harebear adds `loading` (spinner, disabled, `aria-busy`; icon buttons swap the icon for the spinner). Icon-only buttons need `aria-label`. |
| Button group     | `ButtonGroup`, `ButtonGroupSeparator`, `ButtonGroupText`, `buttonGroupVariants`                                                                                                                                                                                                                                                                                                                                                                              |                                                                                                                                                                                                                                                                                                                                                                           |
| Calendar         | `Calendar`, `CalendarDayButton`                                                                                                                                                                                                                                                                                                                                                                                                                              | react-day-picker v10. Combine with `Popover` for a date picker.                                                                                                                                                                                                                                                                                                           |
| Card             | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`                                                                                                                                                                                                                                                                                                                                                              | Bordered, elevated (`shadow-card`), `rounded-xl`, 24px padding. `size="sm"` for 16px. `CardAction` puts a control top-right of the header.                                                                                                                                                                                                                                |
| Code block       | `CodeBlock`, `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockActions`, `CodeBlockCopyButton`, `CodeBlockContent`, `CodeBlockLine`, `CodeBlockFooter`                                                                                                                                                                                                                                                                                                          | Composable code panel (muted fill). `CodeBlockContent` takes `lineNumbers`, `wrap`, `startLine`; `CodeBlockLine variant`: `added`, `removed`, `highlighted`. Pair with `useHighlightedCode` for shiki, or use `CodeSnippet`.                                                                                                                                              |
| Carousel         | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `useCarousel`, type `CarouselApi`                                                                                                                                                                                                                                                                                                                                         | embla.                                                                                                                                                                                                                                                                                                                                                                    |
| Chart            | `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`                                                                                                                                                                                                                                                                                                                                                   | Recharts wrappers. Prefer `TrendChart` for line/area; use these for custom charts.                                                                                                                                                                                                                                                                                        |
| Checkbox         | `Checkbox`                                                                                                                                                                                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                           |
| Check circle     | `CheckCircle`                                                                                                                                                                                                                                                                                                                                                                                                                                                | harebear. 24px round checkbox for to-do rows (44px touch target), pops when ticked (no pop or fade under reduced motion). Focus shows a solid primary outline whatever the `tone`. `tone="important"` tints it; pair with a word. Name it with `aria-labelledby` the row title.                                                                                           |
| Collapsible      | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                           |
| Combobox         | `Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxGroup`, `ComboboxLabel`, `ComboboxCollection`, `ComboboxEmpty`, `ComboboxSeparator`, `ComboboxChips`, `ComboboxChip`, `ComboboxChipsInput`, `ComboboxTrigger`, `ComboboxValue`, `useComboboxAnchor`                                                                                                                                                                 | Searchable select (Base UI). `<Combobox items={list}>` + `<ComboboxList>{(item) => <ComboboxItem value={item}>…}</ComboboxList>`. Chips for multi-select. `ComboboxInput`'s built-in trigger is named "Show options".                                                                                                                                                     |
| Command          | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`                                                                                                                                                                                                                                                                                                              | Use for ⌘K palettes.                                                                                                                                                                                                                                                                                                                                                      |
| Direction        | `DirectionProvider`, `useDirection`                                                                                                                                                                                                                                                                                                                                                                                                                          | RTL/LTR context for Radix components.                                                                                                                                                                                                                                                                                                                                     |
| Context menu     | `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuRadioGroup`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`                                                                                                                     |                                                                                                                                                                                                                                                                                                                                                                           |
| Dialog           | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal`                                                                                                                                                                                                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                           |
| Drawer           | `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`, `DrawerOverlay`, `DrawerPortal`                                                                                                                                                                                                                                                                                               | vaul. Mobile bottom sheets.                                                                                                                                                                                                                                                                                                                                               |
| Dropdown menu    | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`                                                                                                      |                                                                                                                                                                                                                                                                                                                                                                           |
| Empty state      | `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`                                                                                                                                                                                                                                                                                                                                                                       | Use for zero-data screens. harebear adds `size="sm"`: compact, no flex-grow, for empties inside cards and panels.                                                                                                                                                                                                                                                         |
| Field            | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle`                                                                                                                                                                                                                                                                                                             | Form layout. Works with react-hook-form or plain state.                                                                                                                                                                                                                                                                                                                   |
| Hover card       | `HoverCard`, `HoverCardTrigger`, `HoverCardContent`                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                           |
| Input            | `Input`                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 40px, filled `bg-muted`, turns `bg-card` with a primary ring on focus. 44px under `pointer: coarse` (also `InputGroup`).                                                                                                                                                                                                                                                  |
| Input group      | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`                                                                                                                                                                                                                                                                                                                                               | Inputs with icons, prefixes, buttons.                                                                                                                                                                                                                                                                                                                                     |
| Input OTP        | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`                                                                                                                                                                                                                                                                                                                                                                                             |                                                                                                                                                                                                                                                                                                                                                                           |
| Item             | `Item`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemGroup`, `ItemSeparator`, `ItemHeader`, `ItemFooter`                                                                                                                                                                                                                                                                                                                  | Generic list rows. harebear fix: `ItemTitle` clamps to one line (long words break) and shows the full text as a tooltip when clamped, `ItemContent` has `min-w-0`. harebear adds `ItemTitle mono` for commands, paths and IDs.                                                                                                                                            |
| Kbd              | `Kbd`, `KbdGroup`                                                                                                                                                                                                                                                                                                                                                                                                                                            | Mono keycap, 12px text.                                                                                                                                                                                                                                                                                                                                                   |
| Marker           | `Marker`, `MarkerIcon`, `MarkerContent`, `markerVariants`                                                                                                                                                                                                                                                                                                                                                                                                    | Inline status line in a thread ("Conversation saved"). `variant`: `default`, `separator` (date dividers), `border`.                                                                                                                                                                                                                                                       |
| Label            | `Label`                                                                                                                                                                                                                                                                                                                                                                                                                                                      |                                                                                                                                                                                                                                                                                                                                                                           |
| Menubar          | `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarLabel`, `MenubarSeparator`, `MenubarShortcut`, `MenubarGroup`, `MenubarPortal`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`                                                                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                                           |
| Message          | `Message`, `MessageGroup`, `MessageAvatar`, `MessageContent`, `MessageHeader`, `MessageFooter`                                                                                                                                                                                                                                                                                                                                                               | Chat message layout primitive. `align`: `start`, `end`. Put `Bubble`s inside `MessageContent`.                                                                                                                                                                                                                                                                            |
| Message scroller | `MessageScrollerProvider`, `MessageScroller`, `MessageScrollerViewport`, `MessageScrollerContent`, `MessageScrollerItem`, `MessageScrollerButton`, `useMessageScroller`, `useMessageScrollerScrollable`, `useMessageScrollerVisibility`                                                                                                                                                                                                                      | Stick-to-bottom scroll container with a jump-to-latest button. `ChatThread` is the simpler alternative.                                                                                                                                                                                                                                                                   |
| Navigation menu  | `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`, `navigationMenuTriggerStyle`                                                                                                                                                                                                                                      | Marketing-style top nav.                                                                                                                                                                                                                                                                                                                                                  |
| Native select    | `NativeSelect`, `NativeSelectOption`, `NativeSelectOptGroup`                                                                                                                                                                                                                                                                                                                                                                                                 | Styled `<select>`; same filled look as `Input`. Use on mobile-heavy forms.                                                                                                                                                                                                                                                                                                |
| Pagination       | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`                                                                                                                                                                                                                                                                                                                          | `DataTable` has its own pager.                                                                                                                                                                                                                                                                                                                                            |
| Popover          | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                                                                                                                           |
| Progress         | `Progress`                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 8px rounded meter. `UsageMeter` adds a label row.                                                                                                                                                                                                                                                                                                                         |
| Questionnaire    | `Questionnaire`, `QuestionnaireProgress`, `QuestionnaireItem`, `QuestionnaireTitle`, `QuestionnaireDescription`, `QuestionnaireChoices`, `QuestionnaireChoice`, `QuestionnaireChoiceDescription`, `QuestionnaireInput`, `QuestionnaireError`, `QuestionnaireActions`, `QuestionnairePrevious`, `QuestionnaireNext`, `QuestionnaireSkip`, `QuestionnaireSubmit`                                                                                               | Step-by-step multiple choice or input, one question at a time (e.g. an agent asking clarifying questions). `Questionnaire items={[{ name, required }]}`, each `QuestionnaireItem name` matches.                                                                                                                                                                           |
| Radio group      | `RadioGroup`, `RadioGroupItem`                                                                                                                                                                                                                                                                                                                                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                           |
| Resizable        | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`                                                                                                                                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                           |
| Scroll area      | `ScrollArea`, `ScrollBar`                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                           |
| Select           | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                           |
| Separator        | `Separator`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                                           |
| Sheet            | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`                                                                                                                                                                                                                                                                                                                                        | Side panels.                                                                                                                                                                                                                                                                                                                                                              |
| Sidebar          | `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarInput`, `SidebarInset`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `useSidebar` | Active item is a raised card. Prefer `AppShell` unless you need a custom layout. harebear: no border by default (add `border-r` if you want one); in `collapsible="icon"` the content keeps its width while the rail widens. `useSidebarOptional()` returns null outside a provider.                                                                                      |
| Skeleton         | `Skeleton`                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Loading placeholders.                                                                                                                                                                                                                                                                                                                                                     |
| Slider           | `Slider`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                                                                                                                           |
| Spinner          | `Spinner`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                           |
| Switch           | `Switch`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |                                                                                                                                                                                                                                                                                                                                                                           |
| Table            | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`                                                                                                                                                                                                                                                                                                                                                     | Borderless rows with rounded hover; quiet 12px headers. `data-state="selected"` tints a row.                                                                                                                                                                                                                                                                              |
| Tabs             | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants`                                                                                                                                                                                                                                                                                                                                                                                         | `TabsList variant`: `default` (segmented control), `pill` (rounded top-level nav), `line`. Use `Tabs` as a segmented filter too (date ranges, status filters).                                                                                                                                                                                                            |
| Textarea         | `Textarea`                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Same filled style as `Input`, auto-grows.                                                                                                                                                                                                                                                                                                                                 |
| Toast            | `Toaster`, `toast`, `toastUndo`                                                                                                                                                                                                                                                                                                                                                                                                                              | sonner. Mount once; call `toast("Saved")`, `toast.success(...)`, `toast.error(...)` (sonner's `toast`, re-exported by harebear-ui). Follows the theme mode. `toastUndo(message, { onUndo, undoLabel?, duration = 9000 })` shows an Undo toast for something already done.                                                                                                 |
| Toggle           | `Toggle`, `toggleVariants`, `ToggleGroup`, `ToggleGroupItem`                                                                                                                                                                                                                                                                                                                                                                                                 | 44px hit area under `pointer: coarse`.                                                                                                                                                                                                                                                                                                                                    |
| Tooltip          | `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`                                                                                                                                                                                                                                                                                                                                                                                             | Mount `TooltipProvider` once near the root.                                                                                                                                                                                                                                                                                                                               |
| Trace            | `Trace`, `TraceLine`, `TraceIcon`, `TraceTitle`, `TraceDescription`, `TraceCollapsible`, `TraceCollapsibleTrigger`, `TraceCollapsibleContent`                                                                                                                                                                                                                                                                                                                | Agent step log (searched, read, ran). `TraceLine status`: `running` (shimmer), `error`, `pending`.                                                                                                                                                                                                                                                                        |

## Admin and layout

### `SidebarLayout`, `SidebarCollapseButton`

The base layout every shell is built on: a sidebar (brand, actions, scrolling body, footer) next to the main column. On desktop a collapse button shrinks the sidebar to an icon rail (logo tile, icon actions, avatar); on mobile it is a sheet opened with a `SidebarTrigger`. Harebear parts adapt to the rail by themselves (`AppBrand`, `UserChip`, `UserMenu`, `NewConversationButton`, `SearchInput`, `ConversationList`, nav `SidebarMenuButton`s with `tooltip`). Items stay pinned to the left while the width animates (labels fade and clip, icons keep their x); in custom sidebar content, do not center items in the rail with `group-data-[collapsible=icon]:items-center` or `justify-center`, which makes them jump right and slide back.

Props: `brand?`, `sidebarActions?`, `sidebar?` (body), `sidebarFooter?`, `collapsible?` (`"icon"` default, `"offcanvas"` hides it entirely, `"none"` always expanded on desktop), `storageKey?` (remember collapsed state in localStorage, applied after hydration so SSR matches), `defaultOpen?`, `width?` (default `"16rem"`; the rail is `4.25rem`), `className?` (main column), `children` (main column).
`SidebarCollapseButton`: the collapse/expand button with a tooltip, for custom `Sidebar` layouts. Renders nothing on mobile.

```tsx
;<SidebarLayout
  storageKey="app-sidebar"
  brand={<AppBrand name="Console" icon={<SparklesIcon />} />}
  sidebar={<MyNav />}
  sidebarFooter={<UserMenu name={user.name} onSignOut={signOut} />}
>
  <MyPage />
</SidebarLayout>
```

### `AppShell`

Admin layout on `SidebarLayout`: nav sidebar that collapses to an icon rail (nav items show their label as a tooltip there; badges and `sidebarExtra` hide) plus a main column with a top bar.

Props: `brand` (node, usually `AppBrand`), `sidebarActions?`, `nav: AppNavSection[]`, `sidebarExtra` (node under the nav), `sidebarFooter` (node, usually `UserMenu`), `header` (top bar content), `linkComponent` (e.g. Next.js `Link`; default `"a"`), `collapsible?` (default `"icon"`), `storageKey?`, `defaultOpen`, `children` (page content, laid out in a column with 28px gaps).

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

Logo tile + name. Props: `name`, `subtitle?`, `icon?`, `action?` (trailing control). In a sidebar collapsed to its icon rail only the tile shows.

### `PageHeader`

Title row with the page's `h1`. Props: `title`, `description?`, `count?` (badge after title), `eyebrow?` (small text above), `icon?` (leading mark before the title: `CategoryDot`, `MemberAvatar`, a lucide icon at 24px), `actions?` (right side, wraps on mobile).

### `Page`, `PageSection`

`Page`: the page column inside `AppNav` or `SidebarLayout`: centred, 16px gutters on phones (32px from 768px), children spaced `gap-7`. Props: `width?` (`sm | md | lg`, default `md` = 42rem, like `FocusLayout`), div props. `PageSection`: a region named by its `h2` (so headings go h1, h2 without skipping), with `title`, `action?` (right of the heading, 44px tall on touch screens) and `children`. Inside a card, use `Heading level={3}`.

```tsx
;<Page>
  <PageHeader
    title="Groceries"
    icon={<CategoryDot color={1} />}
    actions={<UserMenu compact name={user.name} className="md:hidden" />}
  />
  <PageSection
    title="This week"
    action={
      <Button variant="ghost" size="sm">
        See all
      </Button>
    }
  >
    <SectionedList sections={sections} onToggle={setDone} />
  </PageSection>
</Page>
```

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

Dot or pill for status. Prop `tone`: `success | warning | danger | info | neutral`; `pulse` animates the dot for live states. `StatusBadge` takes Badge props (`variant="outline"` for a white pill, `size="lg"` in headers) and `compact` (below 640px only the dot shows; the label stays for screen readers).

### `UsageMeter`

Label + value over a bar. Props: `label`, `percent` (0-100, clamped), `value?` (bold), `detail?` (muted), `color?` (CSS color, e.g. `"var(--warning)"`), `trackClassName?`.

### `ActivityFeed`

Props: `items: { actor; action; target?; time; avatarUrl?; id? }[]`. Renders "**Maya** commented on **Q4 roadmap**".

### `Timeline`

Vertical events with a rail. Props: `items: { title; time; tone?; id? }[]`.

### `KeyValueGrid`

Label-over-value pairs as a `<dl>`. Props: `items: { label; value }[]`, `columns?: 1 | 2 | 3`.

### `UserChip`

Avatar + name + subtitle. Props: `name`, `subtitle?`, `avatarUrl?`, `color?` (`CategoryColor` behind the initials), `action?`, `size?`. In a sidebar icon rail only the avatar shows. Also exports `initials(name)`.

### `UserMenu`

The signed-in user as a menu button (sidebar footer or top bar). The menu has a header, your items (`children`, e.g. a Settings `DropdownMenuItem`), a Light / Dark / System theme choice, and Sign out. The trigger is named by its visible name and subtitle (in a sidebar icon rail, where it is just the avatar, by `name`) and the menu opens to the side there. `compact` makes the trigger just the avatar anywhere (40px, 44px on touch screens, named "Account menu for {name}") with the menu below it, for a phone page header. Upgrading from 0.9: the non-compact trigger is no longer named "Account menu for {name}"; find it by `name` instead. Props: `name`, `subtitle?`, `avatarUrl?`, `color?` (`CategoryColor` behind the initials), `children?`, `themeSwitch?` (default true, needs `ThemeProvider`), `onSignOut?`, `signOutLabel?`, `compact?`.

```tsx
;<UserMenu name={email} subtitle="Signed in" onSignOut={signOut}>
  <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
    <SettingsIcon />
    Settings
  </DropdownMenuItem>
</UserMenu>
```

### `MemberAvatar`

A person's photo, or their initials on their category colour (`bg-category-N`, `text-category-foreground`). Props: `name`, `avatarUrl?`, `color?: CategoryColor` (1 to 6; without it the soft primary tint), `size?` (`sm` 28px, `default` 36px, `lg` 56px). It is `role="img"` named after the person; pass `aria-hidden` when the name is shown next to it. Used by `UserChip`, `UserMenu` and `TaskRow`.

```tsx
;<MemberAvatar name="Sam Rivera" avatarUrl={sam.photoUrl ?? undefined} color={sam.color} size="sm" />
```

### `AvatarStack`, `VisibilityBadge`

`AvatarStack`: overlapping small `MemberAvatar`s. Props: `members: { name; avatarUrl?; color? }[]`, `max?` (default 4): total slots; past it, `max - 1` faces and a "+N" chip (read as "N more"). `VisibilityBadge`: who can see something. Props: `visibility: "shared" | "private"`, `members?` (faces when shared), `label?` (default "Shared with everyone" or "Only you"; the lock shows when private).

```tsx
;<VisibilityBadge visibility={list.private ? "private" : "shared"} members={household} />
```

### `CategoryDot`

A 10px dot in a category colour, e.g. as the `icon` of a list in `AppNav`'s group. Props: `color: CategoryColor`, `label?` (accessible name when the colour means something on its own, e.g. whose event; decorative without it), `locked?` (adds a lock named `lockLabel?`, default "Only you").

### `ColorSwatchPicker`

The six category colours as a radio group (arrow keys skip taken ones). 32px swatches with 44px touch targets; the chosen one has a check and a ring. Props: `value?: CategoryColor`, `onValueChange?(color)`, `taken?: Partial<Record<CategoryColor, string>>` (colour to who has it: shown with their initial, disabled, named "Violet, taken by Riley"). Name it with `aria-label` or `aria-labelledby`.

```tsx
;<ColorSwatchPicker aria-label="Your colour" value={me.color} onValueChange={setColor} taken={{ 3: "Riley" }} />
```

### `AvatarUpload`, `cropImageToSquare`

Profile photo: a 72px avatar, "Upload a photo" / "Change photo" and "Remove photo". The chosen image is cropped to its centred square at 256x256 in the browser (canvas, JPEG) and previewed at once. Props: `name`, `color?`, `avatarUrl?` (current photo), `onChange(photo: Blob | null)` (an event, not a controlled value) (`null` after Remove), `maxBytes?` (JPEG quality steps down to fit), `onError?(error)` ("Could not read that image." or "That photo is too big."), `description?`. `cropImageToSquare(file, { size?, maxBytes? })` is the crop on its own: a `Promise<Blob>`.

```tsx
;<AvatarUpload
  name={me.name}
  color={me.color}
  avatarUrl={me.photoUrl ?? undefined}
  maxBytes={512 * 1024}
  onChange={(photo) => (photo ? uploadPhoto(photo) : removePhoto())}
  onError={(e) => toast.error(e.message)}
  description="Without a photo, your initial and colour are used."
/>
```

### `ConfirmDialog`

Controlled "are you sure" dialog. Props: `open`, `onOpenChange`, `title`, `description?`, `confirmLabel?`, `cancelLabel?`, `destructive?` (red confirm), `onConfirm`.

### `PromptDialog`

Controlled dialog that asks for one line of text (New list, Rename). Props: `open`, `onOpenChange`, `title`, `description?`, `label` (field label), `defaultValue?`, `submitLabel?` (default "Save"), `cancelLabel?` (default "Cancel"), `maxLength?`, `onSubmit(value): void | Promise<void>` (trimmed; empty is blocked). It closes when `onSubmit` returns or resolves and starts fresh on every open; a thrown error's message shows under the field and the dialog stays open.

```tsx
;<PromptDialog
  open={renaming}
  onOpenChange={setRenaming}
  title="Rename list"
  label="Name"
  defaultValue={list.name}
  submitLabel="Rename"
  maxLength={60}
  onSubmit={(name) => api.renameList(list.id, name)}
/>
```

### `CopyField`

Read-only value with a copy button (IDs, paths, URLs). Props: `value` (copied), `display?` (shown instead, full value as tooltip), `label?` (leading addon), `aria-label?`, `mono?` (default true), `copiedLabel?` (default "Copied"; after copying, the button's name and a label beside it read this for a moment).

### `DateTimePicker`

Date field: a button that opens a `Calendar` in a `Popover`, with an optional time field and a Clear button. Value is a floating local date, no time zone: `DateTimeValue = { date: "YYYY-MM-DD", time?: "HH:MM" }`. Props: `value: DateTimeValue | null`, `onValueChange(value | null)`, `withTime?` (time field under the calendar; enabled once a date is set), `placeholder?` (default "Pick a date"). Other props (`id`, `aria-label`, `disabled`) go to the trigger button. Day cells are 44px on phones.

### `TimeZonePicker`

Searchable IANA time zone field built on `Combobox`, listing `Intl.supportedValuesOf("timeZone")` (underscores shown as spaces, so "new york" matches). A `value` not in that list (an alias such as "US/Pacific") is kept at the top so it still shows. Props: `value` (e.g. `"America/Vancouver"`), `onValueChange(zone)`, `id?` (for a `FieldLabel` or `SettingsRow` `htmlFor`), `className?`.

```tsx
;<SettingsRow
  label="Time zone"
  htmlFor="tz"
  control={<TimeZonePicker id="tz" value={me.timeZone} onValueChange={(timeZone) => save({ timeZone })} />}
/>
```

### `DetailSheet`

A record's details, one API for both sizes: a floating side sheet from 768px up, a full-screen drawer with a close button on phones. Props: `open`, `onOpenChange`, `title` (heading and accessible name), `description?`, `footer?` (pinned under the scrolling body, e.g. Delete), `children` (the fields). `data-layout` is `"sheet"` or `"drawer"`. While open, toasts (e.g. `toastUndo`) stay off it: on desktop they move to the left of the sheet and narrow to fit; on phones they sit above the footer (one row of buttons) or the bottom safe area, in place of the hidden tab bar's space.

```tsx
;<DetailSheet
  open={!!task}
  onOpenChange={(o) => !o && close()}
  title="To-do"
  footer={
    <Button variant="ghost" onClick={askDelete}>
      Delete
    </Button>
  }
>
  <Field>
    <FieldLabel htmlFor="when">When</FieldLabel>
    <DateTimePicker id="when" withTime value={due} onValueChange={setDue} />
  </Field>
</DetailSheet>
```

### `Callout`

Quiet note with an icon (sparkle by default). Props: `icon?`, `tone?` (`"muted" | "soft"`).

### `Celebration`, `celebrate`

An occasional confetti burst, e.g. when the member ticks the last to-do of the day. It only plays when you call `celebrate()`: `CheckCircle`, `TaskRow` and `SectionedList` never fire it (a ticked check has its own small pop). Mount `<Celebration />` once near the root (like `Toaster`), then call `celebrate()` from anywhere. CSS only, about 1.5 s, renders nothing between bursts (`data-slot="celebration"` while it plays), and does nothing under `prefers-reduced-motion`. Keep it rare.

### `LinkTile`

Muted tile that lifts on hover, for service launchers. Props: `title`, `subtitle?` (mono), `icon?`, `status?: { tone; label }`, `href`, or `asChild` with your router `<Link>` as the only child.

### `MarkdownEditor`

Markdown field with Write and Preview tabs; Preview renders with `Markdown`. Props: `value`, `onValueChange(value)`, `renderPreview?(markdown)` (custom renderer, wrapped in `Prose`), `wrapperClassName?`. Other props (`id`, `placeholder`, `aria-*`, `className`) go to the `Textarea`.

```tsx
;<MarkdownEditor id="body" value={body} onValueChange={setBody} />
```

### `ChecklistEditor`

Steps inside a record, e.g. a to-do's checklist: `CheckCircle` per item (the text is its label), a Remove button, an add field (Enter adds the trimmed text and clears), and an "x of y done" line when there are items. Props: `items: { id; text; done }[]`, `onToggle(id, done)`, `onRemove(id)`, `onAdd(text)`, `addPlaceholder?` (also the field's name, default "Add an item"), `progressLabel?(done, total)`. The root is a `role="group"`: name it with `aria-label` or `aria-labelledby`.

```tsx
;<ChecklistEditor
  aria-label="Checklist"
  items={task.checklist}
  onToggle={toggleStep}
  onRemove={removeStep}
  onAdd={addStep}
  addPlaceholder="Add a step"
/>
```

### `CommentThread`

Comments on a record, oldest first, then a box and a submit button (disabled while empty; submits the trimmed text and clears). Bodies render with `Markdown`. Props: `comments: { id; author: { name; color?; avatarUrl? }; meta?; body }[]` (`meta` is muted text after the name, e.g. "via HomeBot · 2 h ago"), `onSubmit(text)`, `placeholder?` (also the box's name, default "Add a comment"), `submitLabel?` (default "Comment"). Show your own empty state if you want one.

```tsx
;<CommentThread comments={task.comments} onSubmit={(text) => api.comment(task.id, text)} />
```

### `AppNav`

One nav config, two renderings: on desktop a `SidebarLayout` sidebar (brand, action button, places, one collapsible group, footer; active place is a raised card; collapses to the icon rail), under 768px a bottom tab bar (first 5 places, 56px targets, `aria-current="page"`) plus a round floating action button. Use it instead of `AppShell` for consumer apps that need phone navigation.

Props: `places: AppNavPlace[]` (`label`, `icon?`, `href?` or `onSelect?`, `active?`, `count?`, `tab?: false` to keep out of the tab bar, `sidebar?: false` for a tab-bar-only place such as Lists when the sidebar has a Lists group), `group?: AppNavGroup` (`label`, `href?` (heading becomes a link, e.g. to all lists; the chevron is a separate "Collapse Lists" button), `active?` (the heading link is the current page), `items`, `defaultOpen?`, `onAdd?`, `addLabel?`), `action?: { label; icon; onSelect; sidebar?: false }` (`sidebar: false` keeps only the round phone button), `brand?`, `footer?` (usually `UserMenu`), `label?` (nav name, default "Main"), `linkComponent?`, `collapsible?`, `storageKey?`, `defaultOpen?`, `width?`, `fill?` (main column is exactly the screen height minus the tab bar (and the round action button's space when `action` is set) and does not scroll, for a chat: the child takes it with `flex-1 min-h-0`, which `ChatPanel` already has), `children`.
On phones the group and footer live in the sidebar sheet: put a `SidebarTrigger` in the page header if users need them there. With `action`, the main column's bottom padding also clears the round button, so a trailing control on the last row is not under it. Render `AssistantDock` inside `children` so it clears the tab bar. Toasts stack above the tab bar, the action button and the dock launcher on their own; no `Toaster` offset needed.

```tsx
;<AppNav fill places={places} footer={<UserMenu name={user.name} />}>
  <ChatPanel title="Assistant" composer={<PromptInput … />}>
    {thread}
  </ChatPanel>
</AppNav>
```

### `FocusLayout`

A page outside the app frame (settings, onboarding, setup): slim sticky top bar, one centred column. Props: `title?`, `back?` (close or back link; icon-only needs `aria-label`), `actions?`, `width?` (`sm | md | lg`, default `md` = 42rem).

### `SettingsSection`, `SettingsRow`

`SettingsSection`: card with `title`, `description?` and rows divided by hairlines (a labelled `region`). `SettingsRow`: `label`, `description?`, `control?` (Switch, Select, ToggleGroup, Button), `htmlFor?` (makes the label a `<label>` for the control), `body?` (always shown under the label, full width, no toggle: a list, a hint, a short form). Add `content` to expand inline (change password, add a connection): without a `control` the row gets a "Change"/"Cancel" button (`expandLabel?`); control it with `open`/`onOpenChange` or `defaultOpen`.

```tsx
;<FocusLayout
  title="Settings"
  back={
    <Button asChild variant="ghost" size="icon">
      <a href="/" aria-label="Close">
        <XIcon />
      </a>
    </Button>
  }
>
  <SettingsSection title="Notifications">
    <SettingsRow
      label="Daily summary"
      description="Every morning at 7"
      htmlFor="daily"
      control={<Switch id="daily" />}
    />
    <SettingsRow label="Password" content={<ChangePasswordForm />} />
    <SettingsRow label="Connections" body={<ConnectionList />} />
  </SettingsSection>
</FocusLayout>
```

### `SettingsDialog`

App settings as a modal that opens over any page, like Notion's. Desktop: a dialog with a section nav at the left (icon and label per section) and a scrolling content pane. Phones (under 768px): full screen, with the sections as a scrollable row of tabs at the top. The nav is a tab list (arrow keys move between sections, each panel is named by its tab), Escape closes it, and focus returns to whatever opened it. Props: `open`, `onOpenChange`, `sections: { id; label; icon?; content }[]` (`content` is usually one or more `SettingsSection`s), `value?` / `onValueChange?` (active section id; open straight at one, e.g. from a "Notification settings" link), `defaultValue?` (default the first section), `title?` (default "Settings"), `description?`. Inactive sections unmount, so keep drafts in your own state if they must survive a switch. On desktop each panel starts with its section label as a heading, so title the cards inside by what they hold (for example "Profile" and "Password" under "You") rather than repeating the label.

```tsx
const [open, setOpen] = useState(false)
const [section, setSection] = useState("general")
// e.g. a Settings item in UserMenu: <DropdownMenuItem onSelect={() => setOpen(true)}>Settings</DropdownMenuItem>
;<SettingsDialog
  open={open}
  onOpenChange={setOpen}
  value={section}
  onValueChange={setSection}
  sections={[
    { id: "general", label: "General", icon: <SettingsIcon />, content: <GeneralSettings /> },
    { id: "homebot", label: "HomeBot", icon: <SparklesIcon />, content: <HomeBotSettings /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon />, content: <NotificationSettings /> },
  ]}
/>
```

## Layout and text

Props instead of class names, for blocks that should look right without styling (dashboard widgets, generated UI). Every class string is a literal, so Tailwind finds them.

### `Stack`, `Row`, `Grid`

`Stack` stacks children vertically, `Row` lays them out horizontally (`align`, `justify`, `wrap`). Both take a named `gap`: `none | xs | sm | md | lg | xl`. `Grid` makes equal columns: `cols={3}` or `cols={{ base: 1, sm: 2, md: 3 }}`. With `query="container"` the breakpoints measure the nearest `@container` ancestor (sm 28rem, md 42rem, lg 56rem) instead of the screen, for blocks that sit in cards of any width.

### `Text`, `Heading`

`Text` takes `size` (`xs | sm | base | lg | xl | 2xl`), `tone` (`default | muted | success | warning | danger | info`), `weight`, `mono`, `truncate`, `lines` (1 to 3) and `tabular`, and renders `as` a span, p or div. `Heading` is a page section title (`level={2}`, under the page `h1`; `PageSection` uses it), a card section title (`level={3}`, default) or a small uppercase group label (`level={4}`). Do not skip levels: a page with an h1 needs h2s before h3s.

### `Metric`, `MetricGroup`

A number with `value`, `unit`, `label` and an optional `delta` in percent, green when it improves (`lowerIsBetter` for latency and the like). `MetricGroup` sets metrics side by side, evenly spaced.

### `MediaItem`

Thumbnail (`image`, `imageShape`: `poster | square | wide`), a two-line `title` (linked when `href` is set, new tab), a `meta` line and a two-line `description`.

### `ShowMore`

Shows the first `initial` children (default 5) and a "Show N more" button for the rest.

### `Collapse`

Animates children between full height and 0 (CSS `grid-template-rows`), so neighbours slide instead of jumping. Closed content is `inert` and `aria-hidden`. Clips vertically only, so focus rings and hit areas at the sides are not cut off. Props: `open`, `contentClassName?`. No motion under `prefers-reduced-motion`.

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

### `TaskRow`

One to-do: `CheckCircle` aligned with the first line, title, one meta line, optional assignee avatar. Props: `title`, `checked`, `onCheckedChange(checked)`, `meta?`, `assignee?: { name; avatarUrl?; color? }` (a `MemberAvatar`), `important?` (say it in `meta` too), `onOpen?` (title becomes a button, e.g. to open a sheet), `disabled?`.

### `SectionedList`

A to-do list: one add box at the top, sections with headings, done items folded into a "Show N done" toggle, an empty state. A ticked row stays struck through for `lingerMs`, then folds away with `Collapse`. Props: `sections: { id; title?; action?; empty?; items: SectionedListItem[] }[]` (item: `id`, `title`, `meta?`, `done?`, `important?`, `assignee?`), `onToggle(id, done)`, `lingerMs?` (default 600; 9000 matches `toastUndo`), `renderItem?(item, toggle)`, `onAdd?(text)`, `addPlaceholder?` (default "Add a to-do"), `addChips?(text)`, `onOpen?(id)`, `empty?`, `defaultShowDone?`.

- Section `id` is also the `<section>`'s DOM id, so `DayStrip` or an `#id` link can jump to it. Keep ids unique on the page.
- `action` sits at the right of the heading (a small ghost `Button`, e.g. "Move to today"; stretched to 44px on phones). `empty` keeps the section shown with that text when nothing in it is open ("Nothing planned").
- `renderItem` draws other rows, e.g. `AgendaRow`. Its `toggle(done)` lingers and folds the row like a `TaskRow`. Items without `done` (events) always stay. Type the items with `SectionedList<MyItem>`.
- `addChips(text)` returns chips shown at the right of the add box while it has text, like `AskBox` `chips` (the date or person parsed from the text).

```tsx
;<SectionedList
  sections={[{ id: "today", title: "Today", items: todos }]}
  onToggle={(id, done) => setDone(id, done)}
  onAdd={addTodo}
  empty={<Empty title="All clear" />}
/>
```

### `AgendaRow`

One line of a day's agenda: time column, event icon (or a `CheckCircle` for a to-do), title, one meta line, whose dot and name. Props: `title`, `time?` ("3:15", "All day"), `meta?`, `who?: { name; color: CategoryColor }` (`CategoryDot` before the name), `checked?` + `onCheckedChange?(checked)` (draws the check instead of the icon), `important?`, `onOpen?` (title becomes a button, e.g. to open an event dialog).

### `DayStrip`

A row of day links (short weekday, date, a dot when `hasPlans`) that smooth-scroll to the element whose id is the day's `id` (instant under reduced motion) and move focus to it; scrolls sideways when the days do not fit. Props: `days: { id; date: "YYYY-MM-DD"; hasPlans? }[]` (floating local date, like `DateTimePicker`), `value?` (selected id, `aria-current`), `onValueChange?(id)`, `aria-label?` (default "Jump to a day"), `sticky?` (sticks at `top-0` with the page background while the page or any container scrolls, and gives the jumped-to element a `scroll-margin-top` as tall as the strip so its heading lands below it; add `className="top-14"` under a sticky header). Each link's name is the full date ("Thursday, November 12, has plans") as visually hidden text, so it contains what is shown.

```tsx
;<>
  <DayStrip
    sticky
    days={week.map((d) => ({ id: d.key, date: d.date, hasPlans: d.items.length > 0 }))}
    value={day}
    onValueChange={setDay}
  />
  <SectionedList<WeekItem>
    lingerMs={9000}
    sections={week.map((d) => ({ id: d.key, title: d.label, empty: "Nothing planned", items: d.items }))}
    onToggle={setDone}
    renderItem={(i, toggle) => (
      <AgendaRow
        time={i.time}
        title={i.title}
        who={i.who}
        {...(i.kind === "todo" && { checked: !!i.done, onCheckedChange: toggle })}
        onOpen={() => open(i)}
      />
    )}
  />
</>
```

## AI and chat

A chat screen is `ChatShell` (sidebar with `AppBrand`, `NewConversationButton`, `ConversationList`, `UserMenu`; optional details panel) around a `ChatPanel` (header, thread, `PromptInput`). Agent apps add `ToolGroup`/`ToolStep` for tool calls and `ApprovalCard`/`ApprovalResult` for permission prompts. See `playground/screens/chat.tsx` and `playground/screens/agent.tsx`.

### `ChatShell`

Full-height chat layout on `SidebarLayout`, so the sidebar collapses to an icon rail on desktop (logo, actions, expand button, avatar) and is a sheet on mobile. Props: `brand?`, `sidebarActions?` (stays in the rail), `sidebar?` (hidden in the rail), `sidebarFooter?`, `collapsible?`, `details?` (right panel: inline at 1280px and up, a sheet below; `ChatPanel` gets a toggle button), `detailsTitle?` (default "Details"), `defaultDetailsOpen?`, `storageKey?` (remember collapsed state in localStorage), `defaultOpen?`, `children` (a `ChatPanel`). Includes a `TooltipProvider`.

```tsx
;<ChatShell
  storageKey="app-sidebar"
  brand={<AppBrand name="netadmin" subtitle="Home network agent" icon={<TerminalIcon />} />}
  sidebarActions={<NewConversationButton onClick={newChat} />}
  sidebar={<ConversationList groups={groupByDate(chats, (c) => c.updated, toRow)} activeId={id} onSelect={open} />}
  sidebarFooter={<UserMenu name={email} subtitle="Signed in" onSignOut={signOut} />}
  details={<Card size="sm">…</Card>}
  detailsTitle="Conversation details"
>
  <ChatPanel
    title={title}
    description="Started 9:41"
    actions={<StatusBadge size="lg" tone="info" pulse>Working</StatusBadge>}
    notice={offline && "Reconnecting…"}
    conversationId={id}
    composer={<PromptInput … />}
  >
    {thread}
  </ChatPanel>
</ChatShell>
```

### `ChatPanel`

The chat column as a card. Props: `title?`, `description?`, `actions?` (header controls), `notice?` (warning bar under the header), `composer?`, `conversationId?` (changing it resets the thread scroll), `autoScroll?`, `children` (thread content). Inside `ChatShell` it adds the mobile sidebar button and the details toggle itself. Works on its own in any bounded-height column.

### `ChatThread`

Scrollable log that sticks to the bottom as content streams in (unless the user scrolls up). Give it a bounded height (e.g. `flex-1` inside a fixed-height column). Props: `autoScroll?` (default true), `contentClassName?` (inner column, max-width 760px).

### `ChatMessage`

One turn. Props: `role: "user" | "assistant"` (matches AI SDK message roles), `avatar?` (assistant only, defaults to `AssistantAvatar`; `false` for none and full-width content, for agent threads where one turn is many blocks), `actions?` (assistant only, under the content), `variant?` (user bubble: `"muted"` default or `"soft"` accent tint), `children`. Long words wrap, in assistant content too.
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

Composer. Props: `value`, `onValueChange`, `onSubmit(text)` (Enter sends trimmed text, Shift+Enter is a newline), `placeholder?`, `label?` (the field's accessible name, default the placeholder), `loading?` + `onStop?` (send becomes stop), `queue?` (Enter and send still work while `loading`, beside Stop, so the app can queue a follow-up), `onAttach?` (shows paperclip), `tools?` (chips), `footer?` (disclaimer), `disabled?`, `autoFocus?`.
`PromptInputChip` is a pill toggle for the tools slot: `active`, `tone?` (`"warning"`), `onClick`, children (icon + label).

### `PromptInputSelect`

Composer chip that picks one mode from a menu (permission level, agent vs. ask). Props: `options: { value; label; description?; icon?; tone? }[]` (`tone: "warning"` colors the chip while that option is selected), `value`, `onValueChange`, `label?` (menu heading), `disabled?`, `title?`.

### `ModelPicker`

Pill showing the active model with a status dot, opening a menu. Props: `models: { id; label?; description?; status?; group? }[]` (`group`, e.g. the provider, sections the menu), `value` (listed and checked even when missing from `models`), `onValueChange`, `label?`, `disabled?`.

### `ConversationList`

Grouped thread list. Props: `groups: { label; items: Conversation[] }[]`, `activeId?`, `onSelect?(id)`, `onDelete?(conversation)` (adds a delete button per row that confirms first; `deleteDescription?` is the confirmation body), `renderAction?(conversation)` (any other trailing control, e.g. a "…" `DropdownMenu`; wins over `onDelete`; on desktop it shows on hover, keyboard focus, or while its menu is open), `empty?`. A row (`data-slot="conversation-item"`) has `data-state="open"` and keeps its hover highlight while a menu or popover opened from its action is open (any descendant with `aria-expanded="true"`).
`Conversation = { id; title; description?; tone?; pulse?; deleteDisabled? }`: `description` is the second line (time, or a live state with a `tone` dot); `deleteDisabled` blocks delete for that row (a string is the reason, shown as the tooltip).
Inside a `Sidebar` it closes the mobile sheet on select and hides in the icon rail.
`groupByDate(items, getDate, toConversation, options?)` buckets items into Today / Yesterday / Previous 7 days / Earlier, newest first. `options` is `{ now?, buckets? }` (or just `now`); `buckets: "week"` gives Today / This week (the 6 days before today) / Earlier.
`formatWhen(date, now?, locale?)`: short timestamp for rows and headers: the time today ("9:41 AM"), the date this year ("Nov 3"), else with the year.

### `NewConversationButton`

Sidebar header button. Full width with label; an icon with a tooltip in the icon rail; closes the mobile sheet on click. Props: Button props, `label?` (default "New conversation"), `icon?`, `shortcut?`.

### `ToolCall`

Outlined chip for a tool call. Props: `status?` (`running` shows a spinner, `done`, `error`), `icon?`, `children` (summary).

### `TypingIndicator`

Three pulsing dots. Props: `label?` (text after the dots, e.g. "Working"), `variant?` (`"muted"` or `"primary"` dots).

### `ToolGroup`, `ToolStep`, `ToolStatusIcon`

Agent tool calls as a bordered, collapsible card. Titles, labels and details wrap instead of cutting off. `ToolStatus = "queued" | "waiting" | "running" | "done" | "error" | "stopped"`.
`ToolGroup` props: `title`, `status`, `meta?` (e.g. time), `autoOpen?` (default open while active, until the user toggles), `open?`/`onOpenChange?`.
`ToolStep` props: `icon?`, `kind` (verb column; with an empty `detail` it is the whole label, for plain-language steps such as "Added milk"), `detail` (monospace command or path, or `""`), `status`, `meta?` (default from status), `output?` (monospace, shown when expanded; omit for a fixed row), `autoOpen?` (default open while running).
`ToolStatusIcon`: spinner while running, else a toned dot. Lighter alternative: `Trace`.

```tsx
;<ToolGroup title="Ran 2 commands on services" status="done" meta="9:42">
  <ToolStep icon={<TerminalIcon />} kind="Run" detail="docker ps" status="done" meta="12 lines" output={out} />
</ToolGroup>
```

### `ApprovalCard`, `ApprovalResult`

`ApprovalCard`: warning-ringed card for anything the agent waits on the user for. Props: `title`, `description?`, `icon?` (default shield, `null` for none), `reason?` (shown first after a bold "Why:"), `code?` + `codeLabel?` (wrapped code block with copy), `actions?` (buttons), `footer?`, `children` (more body).
`ApprovalResult`: short record of a decision in the thread; wraps when long. Props: `decision: "approved" | "denied"`, `time?`, `children`.

### `AssistantProvider`, `useAssistant`, `useAssistantPage`

One assistant conversation across pages. `AssistantProvider` props: `onSend(text, { page, messages, append, update, signal })` (return the reply, or `append`/`update` messages yourself for streaming and receipts; a thrown error becomes the reply; `signal` aborts with `signal.reason` `"stop"` when the user presses Stop and `"superseded"` when the next send starts, so pass it to `fetch`, or listen for `abort` and tell your server to stop only on `"stop"`; after either abort that send's return value and later `append`/`update` calls are dropped, so on `"superseded"` show the rest of the run through the new send), `initialMessages?`, `defaultOpen?`. `useAssistant()` returns `{ open, setOpen, toggle, messages, pending, reply, page, setPage, send, stop, append, update, clear }`: `send(text, { open: false }?)` skips opening the dock, `stop()` aborts the running send (reason `"stop"`), ends `pending` and drops its late reply, `reply` is the assistant messages after the latest user message (null until there is one), for `AskBox`. A page calls `useAssistantPage({ id, title?, data?, suggestions? })` to become the context while mounted.

### `AssistantDock`

The assistant as a floating panel over the page (never reflows it): header (icon, title, your `actions`, full-screen link, close), empty state with suggestions, thread, `AskBox` (Stop while the assistant works, wired to `useAssistant().stop`). Closed, it is a soft launcher button. Escape closes and returns focus to the launcher. Props: `title?` (default "Assistant"), `icon?`, `fullScreenHref?`, `actions?` (header controls before the full-screen link, e.g. a "New chat" icon button with an `aria-label`), `emptyTitle?`, `emptyDescription?`, `suggestions?` (default: the page's), `placeholder?`, `dictation?`, `launcher?` (false when another control opens it), `launcherLabel?`, `queue?` (send follow-ups while the assistant works; the running send's `signal` aborts with reason `"superseded"` and its later output is dropped, so the new send shows the rest; Stop stays).

### `AskBox`

Large rounded composer: auto-growing text, `chips` shown while there is text, suggestion pills, `DictationButton`. The focus ring is on the box (`focus-box`). Props: `value`, `onValueChange`, `onSubmit(text)`, `placeholder?` (also the label, default "Ask anything"), `chips?`, `suggestions?`, `onSuggestion?` (default submits), `dictation?` (`SpeechSource`, or `false` to hide the mic), `lang?`, `disabled?`, `pending?` (blocks sending; with `onStop?` the send button becomes Stop), `queue?` (sending works while `pending`, with send beside Stop, so the app can queue a follow-up), `reply?` (the answer under the box; passing it, even `null`, shows "Working" while `pending`), `chatHref?` (an "Open chat" link under the reply).

```tsx
// Inline answer under the box (no dock), e.g. a Today page
const { send, pending, stop, reply } = useAssistant()
;<AskBox
  value={text}
  onValueChange={setText}
  onSubmit={(t) => {
    setText("")
    send(t, { open: false })
  }}
  pending={pending}
  onStop={stop}
  reply={reply}
  chatHref={`/chat/${conversationId}`}
/>
```

### `DictationButton`, `useDictation`, `browserSpeechSource`

`DictationButton`: one round button that is a mic when the text is empty, stop with listening bars while listening (announces "Listening" politely), send once there is text. Props: `value`, `onTranscript(text)`, `onSend?` (else it submits the form), `source?`, `lang?`, `disabled?`. Without a supported source the mic is hidden.
`SpeechSource` is `{ isSupported(); start(handlers, { lang }) => stop }`; `browserSpeechSource` (default) uses the Web Speech API. `useDictation({ source?, lang?, onTranscript })` returns `{ supported, listening, interim, error, start, stop }` for custom controls.

### `ActionReceipt`

What the assistant did, as a compact card: round check, `title` (past tense), `meta?` (wraps when long), Undo (`onUndo?`, `undoLabel?`). `undone` strikes it through and shows "Undone".

### `CodeSnippet`, `InlineCode`, `Prose`, `ProseBlockquote`

`CodeSnippet`: one-prop code panel with language label, copy button and shiki syntax highlighting (each language loads on first use). Props: `code`, `language?` (`bash`, `tsx`, `ts`, `js`, `json`, `python`, `sql`, `yaml`, `css`, `html`, `markdown`, `diff`; others render plain), `highlight?` (default true), `lineNumbers?`, `hideCopy?`. Built on the `CodeBlock` primitives; drop to those for diffs or highlighted lines.
`InlineCode`: monospace span. `truncate?: number` cuts longer string children with an ellipsis and puts the full text in the tooltip.
`Prose`: typography for model output and markdown. Styles plain `p, ul, ol, li, strong, a, code, pre, h1-h4, blockquote, table` children.
Tip boxes: a blockquote whose first word is `Tip:` (`> Tip: Turn the power off first.`) renders as a `Callout` without the word. Prose does this for plain `<blockquote>` children; with your own react-markdown pass `components={{ blockquote: ProseBlockquote }}`.

### `Markdown`

Renders a Markdown string inside `Prose`: GitHub flavoured (tables, task lists, strikethrough, autolinks), `> Tip:` blockquotes as a `Callout`. Safe for user and model text: raw HTML is dropped and `javascript:` links are removed. Props: `children: string`, `linkComponent?` (your router `Link`, gets `href`; used for links without a scheme such as `/lists/2`). Other props go to the `Prose` wrapper.

```tsx
;<Markdown linkComponent={Link}>{message.text}</Markdown>
```

### Chat primitives vs. composites

harebear's chat composites (`ChatThread`, `ChatMessage`, `PromptInput`, `ToolCall`) give you the reference chat screen with few props. shadcn's chat primitives (`Message`, `Bubble`, `MessageScroller`, `Attachment`, `Trace`, `Marker`, `Questionnaire`) are lower level and composable. Mix freely: e.g. a `Trace` inside an assistant `ChatMessage`, or `Attachment`s in `PromptInput`'s `tools` slot.

## Auth

Parameterized versions of shadcn's login-01..05 and signup-01..05 blocks.

### `AuthLayout`

Full-page wrapper. Props: `variant` (`"centered"` card on the page, `"muted"` same on a muted background, `"split"` form left and cover image right, `"card-image"` one wide card with form and image), `brand?` (usually `AppBrand`), `image?: { src; alt }` (split and card-image), `footer?` (terms text), `children` (the form).

### `AuthForm`

The shell the auth forms share; use it for other signed-out steps (join with a code, verify an email). Props: `title`, `description?`, `children` (fields, each with a `name`), `error?`, `submitLabel`, `loading?` (spinner, disables every control), `onSubmit?(data: FormData)` (after browser validation, which `noValidate` skips; omit to submit natively), `footer?` (under the button: links, provider buttons).

```tsx
;<AuthForm title="Join your household" submitLabel="Join" onSubmit={(d) => join(String(d.get("code")))}>
  <Field>
    <FieldLabel htmlFor="code">Invite code</FieldLabel>
    <Input id="code" name="code" required />
  </Field>
</AuthForm>
```

### `LoginForm`

Props: `onSubmit?({ email, password? })` (omit to submit natively to an `action`), `mode?` (`"password"` or `"email-only"` for magic links), `providers?: { id; label; icon? }[]` + `onProviderClick?(id)` (3+ providers with icons collapse to an icon row), `providersFirst?`, `forgotPasswordHref?`, `signupHref?`, `title?`, `description?`, `submitLabel?`, `loading?`, `error?`.

### `PasswordInput`

Password `Input` with a Show/Hide button (`aria-label` "Show password" / "Hide password") that switches `type` between `password` and `text`. Input props go to the input; `wrapperClassName?` styles the wrapper. `LoginForm`, `SignupForm` and `NewPasswordForm` use it for every password field.

### `SignupForm`

Props: `onSubmit?({ name?, email, password }, data: FormData)`, `children?` (extra fields before the name, e.g. a household name; read them from `data`), `nameField?` (default true), `confirmPassword?` (default true; mismatches are blocked with a browser validation message), `minPasswordLength?` (default 8), `passwordHint?`, `providers?`, `onProviderClick?`, `providersFirst?`, `loginHref?`, `title?`, `description?`, `submitLabel?`, `loading?`, `error?`.

```tsx
;<SignupForm onSubmit={(v, data) => create({ ...v, household: String(data.get("household")) })}>
  <Field>
    <FieldLabel htmlFor="household">Household name</FieldLabel>
    <Input id="household" name="household" required />
  </Field>
</SignupForm>
```

### `NewPasswordForm`

Reset or first password: "New password" + "Confirm password" (a mismatch is blocked with a browser validation message). Props: `onSubmit?({ password })`, `minPasswordLength?` (default 8), `passwordHint?`, `title?` (default "Choose a new password"), `description?`, `submitLabel?` (default "Save password"), `loading?`, `error?`.

```tsx
;<AuthLayout variant="centered">
  <NewPasswordForm onSubmit={({ password }) => reset(token, password)} loading={pending} error={error} />
</AuthLayout>
```

`GitHubIcon`, `GoogleIcon`, `AppleIcon`: brand marks for provider buttons.

```tsx
;<AuthLayout
  variant="split"
  brand={<AppBrand name="Console" icon={<SparklesIcon />} />}
  image={{ src: "/cover.jpg", alt: "" }}
>
  <LoginForm
    onSubmit={signIn}
    loading={pending}
    error={error}
    forgotPasswordHref="/forgot"
    signupHref="/signup"
    providers={[{ id: "github", label: "GitHub", icon: <GitHubIcon /> }]}
    onProviderClick={(id) => signInWith(id)}
  />
</AuthLayout>
```

## Hooks and utilities

| Export                                                              | Use                                                                                                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useCopyToClipboard(resetMs?)`                                      | `{ copied, copy(text) }` for copy buttons.                                                                                                              |
| `useHighlightedCode(code, language)`                                | Shiki-highlighted lines (one node per line) for custom `CodeBlock`s; plain lines until the language loads.                                              |
| `loadHighlighter(language)`, `highlightCode(code, language)`        | Async shiki access outside React.                                                                                                                       |
| `useIsMobile()`                                                     | `true` under 768px.                                                                                                                                     |
| `useAssistant()`, `useAssistantPage(page)`, `useDictation(options)` | See [`AssistantProvider`](#assistantprovider-useassistant-useassistantpage) and [`DictationButton`](#dictationbutton-usedictation-browserspeechsource). |
| `useMediaQuery(query)`                                              | `true` while the media query matches; `false` during SSR.                                                                                               |
| `categoryBg[color]`, type `CategoryColor`                           | `bg-category-N` class for a colour `1..6`, as a complete class name.                                                                                    |
| `cn(...classes)`                                                    | clsx + tailwind-merge. Use for every `className` you compose.                                                                                           |

## Tokens

Use these as Tailwind utilities (`bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, `stroke-*`):

| Token                                      | Use                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `background` / `foreground`                | Page background and body text.                                                                          |
| `card` / `card-foreground`                 | Raised surfaces (cards, active nav item, popovers via `popover`).                                       |
| `muted` / `muted-foreground`               | Inputs, segmented controls, quiet panels; secondary text and labels.                                    |
| `primary` / `primary-foreground`           | Brand accent (from `--brand`). Primary buttons, links, chart line.                                      |
| `primary-soft` / `primary-soft-foreground` | Tinted primary background for selected rows, soft badges, icon circles, and the text that goes on it.   |
| `secondary`, `accent`                      | Same as muted; kept for shadcn compatibility.                                                           |
| `success`, `warning`, `destructive`        | Status colors. Use `bg-success/12 text-success` for soft status fills.                                  |
| `border`, `input`, `ring`                  | Hairlines, input borders, focus rings.                                                                  |
| `chart-1` … `chart-5`, `chart-grid`        | Data series and gridlines.                                                                              |
| `category-1` … `category-6`                | Members, lists, calendars: blue, teal, violet, rose, slate, cyan, each with a dark value. Never status. |
| `category-foreground`                      | Text and icons on a category fill (initials, a swatch's check).                                         |
| `sidebar-*`                                | Sidebar surfaces (default to the page tokens).                                                          |

Put text on `bg-primary-soft` in `text-primary-soft-foreground`, not `text-primary`. In dark mode plain primary on the soft tint is 4.35:1 with the default brand, under axe's 4.5:1; the soft foreground is primary mixed with 30% white there (6.6:1) and plain primary in light mode. The soft Button and Badge, Avatar initials and the toast action use it. Icons alone need only 3:1, so `text-primary` is fine for them.

Other theme values: `rounded-sm/md/lg/xl/2xl` scale from `--radius` (default 14px; cards use `xl`, buttons and inputs `md`), `shadow-card` (the one elevation), `font-sans` (Geist), `font-mono` (Geist Mono), `animate-typing`.

Utilities: `focus-box` gives the box around a bare field the focus ring (primary border, card fill, 4px halo); pair it with `border border-transparent bg-muted`. `animate-check-pop` and `animate-listening` are the check and dictation animations. All motion is off under `prefers-reduced-motion`.

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
