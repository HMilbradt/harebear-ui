import {
  ArrowUpDownIcon,
  BellIcon,
  DatabaseIcon,
  EllipsisIcon,
  ListFilterIcon,
  MailIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  createDataTableColumnHelper,
  DataTable,
  KeyValueGrid,
  Label,
  PageHeader,
  StatusBadge,
  type StatusTone,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  ThemeToggle,
  Timeline,
  UsageMeter,
  UserChip,
} from "@/index"

type Customer = {
  id: string
  name: string
  email: string
  status: "Active" | "Trial" | "Past due" | "Churned"
  plan: string
  mrr: number
  last: string
  company: string
  location: string
  since: string
  seats: number
  used: number
}

const tone: Record<Customer["status"], StatusTone> = {
  Active: "success",
  Trial: "info",
  "Past due": "warning",
  Churned: "neutral",
}

const rows: Customer[] = [
  ["Maya Chen", "Active", "Scale", 1240, "2 min ago", "Northwind", "Vancouver, BC", 40, 34],
  ["Jordan Ellis", "Trial", "Pro", 0, "18 min ago", "Lumen Labs", "Seattle, WA", 10, 3],
  ["Priya Natarajan", "Active", "Pro", 420, "1 hour ago", "Kitebird", "Toronto, ON", 15, 12],
  ["Tom Okafor", "Past due", "Starter", 64, "3 hours ago", "Okafor & Co", "Lagos, NG", 5, 5],
  ["Lena Fischer", "Active", "Scale", 2980, "Yesterday", "Fischer GmbH", "Berlin, DE", 80, 61],
  ["Sam Rivera", "Active", "Pro", 380, "Yesterday", "Tidepool", "Austin, TX", 12, 9],
  ["Aiko Tanaka", "Churned", "Starter", 0, "Oct 28", "Hoshi Studio", "Osaka, JP", 3, 0],
  ["Noah Becker", "Trial", "Scale", 0, "Oct 27", "Brightline", "Denver, CO", 25, 6],
  ["Zara Ahmed", "Active", "Pro", 510, "Oct 26", "Cedar Health", "London, UK", 20, 17],
  ["Leo Martins", "Active", "Starter", 49, "Oct 25", "Martins Bikes", "Lisbon, PT", 3, 2],
  ["Ines Duarte", "Past due", "Pro", 290, "Oct 24", "Faro Foods", "Porto, PT", 8, 8],
  ["Omar Haddad", "Active", "Scale", 1720, "Oct 22", "Atlas Freight", "Dubai, AE", 50, 44],
].map(([name, status, plan, mrr, last, company, location, seats, used], i) => ({
  id: String(i + 1),
  name: name as string,
  email: `${String(name).split(" ")[0]?.toLowerCase()}@${String(company).split(" ")[0]?.toLowerCase()}.com`,
  status: status as Customer["status"],
  plan: plan as string,
  mrr: mrr as number,
  last: last as string,
  company: company as string,
  location: location as string,
  since: ["Mar 2024", "Nov 2026", "Jan 2025", "Jun 2025", "Aug 2023"][i % 5] as string,
  seats: seats as number,
  used: used as number,
}))

const money = (n: number) => (n ? `$${n.toLocaleString("en-US")}` : "$0")
const col = createDataTableColumnHelper<Customer>()
const columns = col.columns([
  // Accessor joins name + email so the search box matches either.
  col.accessor((r) => `${r.name} ${r.email}`, {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="text-xs">
            {row.original.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span className="flex flex-col leading-snug">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-[13px] text-muted-foreground">{row.original.email}</span>
        </span>
      </span>
    ),
  }),
  col.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => (
      <StatusBadge variant="outline" tone={tone[getValue()]}>
        {getValue()}
      </StatusBadge>
    ),
  }),
  col.accessor("plan", { header: "Plan" }),
  col.accessor("mrr", {
    header: "MRR",
    meta: { align: "right" },
    cell: ({ getValue }) => <span className="font-medium tabular-nums">{money(getValue())}</span>,
  }),
  col.accessor("last", {
    header: "Last active",
    enableSorting: false,
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
  }),
])

export function RecordsScreen() {
  const [filter, setFilter] = useState("All")
  const [selectedId, setSelectedId] = useState("1")
  const data = useMemo(() => (filter === "All" ? rows : rows.filter((r) => r.status === filter)), [filter])
  const sel = rows.find((r) => r.id === selectedId) ?? rows[0]!

  return (
    <div className="mx-auto flex max-w-360 flex-col gap-7 px-4 pt-4 pb-12 md:px-8">
      <header className="flex flex-wrap items-center gap-4">
        <div className="mr-2 flex items-center gap-2.5">
          <div className="grid size-8.5 place-items-center rounded-md bg-primary text-primary-foreground">
            <DatabaseIcon className="size-[18px]" />
          </div>
          <span className="text-[15px] font-semibold">Records</span>
        </div>
        <Tabs defaultValue="customers" className="max-w-full overflow-x-auto">
          <TabsList variant="pill" aria-label="Sections">
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex-1" />
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <BellIcon />
        </Button>
        <Avatar>
          <AvatarFallback>HM</AvatarFallback>
        </Avatar>
      </header>

      <PageHeader
        title="Customers"
        count={248}
        description="Everyone with an account, newest activity first."
        actions={
          <>
            <Button variant="outline">
              <UploadIcon />
              Import
            </Button>
            <Button>
              <PlusIcon />
              Add customer
            </Button>
          </>
        }
      />

      <section className="flex flex-wrap items-start gap-5">
        <Card className="min-w-0 flex-[999_1_620px] px-3.5 pt-5 pb-3.5">
          <DataTable
            columns={columns}
            data={data}
            getRowId={(r) => r.id}
            searchable
            searchPlaceholder="Search name or email"
            selectable
            activeRowId={selectedId}
            onRowClick={(r) => setSelectedId(r.id)}
            pageSize={9}
            className="[&>div:first-child]:px-1.5"
            toolbar={
              <>
                <Tabs value={filter} onValueChange={setFilter}>
                  <TabsList aria-label="Filter by status">
                    {["All", "Active", "Trial", "Past due"].map((f) => (
                      <TabsTrigger key={f} value={f}>
                        {f}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Button variant="dashed" size="sm" className="h-10">
                  <ListFilterIcon />
                  Filter
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" className="h-10">
                  <ArrowUpDownIcon />
                  Sort: Last active
                </Button>
              </>
            }
          />
        </Card>

        <Card className="min-w-0 flex-[1_1_360px] gap-6.5 px-6" aria-label="Customer details">
          <div className="flex items-start justify-between gap-3">
            <UserChip name={sel.name} subtitle={sel.email} size="lg" />
            <Button variant="ghost" size="icon" aria-label="Close details" className="-mt-1.5 -mr-2">
              <XIcon />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={tone[sel.status]}>{sel.status}</StatusBadge>
            <Badge variant="soft">{sel.plan} plan</Badge>
            <Badge variant="secondary">{sel.seats} seats</Badge>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1">
              <MailIcon />
              Email
            </Button>
            <Button variant="secondary" className="flex-1">
              <PencilIcon />
              Edit
            </Button>
            <Button variant="secondary" size="icon" aria-label="More actions">
              <EllipsisIcon />
            </Button>
          </div>
          <div className="flex flex-col gap-3.5">
            <h3 className="font-semibold">Details</h3>
            <KeyValueGrid
              items={[
                { label: "Company", value: sel.company },
                { label: "Location", value: sel.location },
                { label: "Customer since", value: sel.since },
                { label: "Account owner", value: "Harrison M." },
                { label: "MRR", value: <span className="font-semibold tabular-nums">{money(sel.mrr)}</span> },
                {
                  label: "Lifetime value",
                  value: <span className="font-semibold tabular-nums">{money(sel.mrr * 19)}</span>,
                },
              ]}
            />
          </div>
          <UsageMeter
            label={<span className="text-sm font-semibold">Seat usage</span>}
            percent={(sel.used / sel.seats) * 100}
            detail={`${sel.used} of ${sel.seats}`}
          />
          <div className="flex flex-col gap-3.5">
            <h3 className="font-semibold">Activity</h3>
            <Timeline
              items={[
                { title: "Upgraded to Scale", time: "Nov 2, 2026", tone: "success" },
                { title: "Invoice #1182 paid", time: "Nov 1, 2026" },
                { title: "Added 10 seats", time: "Oct 14, 2026" },
                { title: "Support ticket closed", time: "Sep 30, 2026", tone: "neutral" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="note" className="text-sm font-semibold">
              Note
            </Label>
            <Textarea id="note" rows={3} placeholder="Add a private note…" />
          </div>
        </Card>
      </section>
    </div>
  )
}
