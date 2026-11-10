import {
  BellIcon,
  ChartColumnIcon,
  ChevronsUpDownIcon,
  DollarSignIcon,
  DownloadIcon,
  EllipsisIcon,
  InboxIcon,
  LayoutDashboardIcon,
  PlusIcon,
  ShoppingBagIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TargetIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"
import { useState } from "react"
import {
  ActivityFeed,
  AppBrand,
  AppShell,
  Avatar,
  AvatarFallback,
  BarList,
  Button,
  Callout,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  SearchInput,
  StatCard,
  StatusBadge,
  StatusDot,
  type StatusTone,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  ThemeToggle,
  TrendChart,
  TrendLegend,
  UsageMeter,
  UserChip,
} from "@/index"

const visitors = Array.from({ length: 30 }, (_, i) => {
  const wk = i % 7 === 5 || i % 7 === 6 ? -420 : 0
  const d = new Date(2026, 9, 11 + i)
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    current: Math.round(2500 + 26 * i + 380 * Math.sin(i / 3.2) + wk + 140 * Math.cos(i * 1.7)),
    previous: Math.round(2350 + 12 * i + 300 * Math.sin(i / 3.6 + 1) + wk * 0.8 + 120 * Math.cos(i * 1.3)),
  }
})
const series = [
  { key: "current", label: "This period" },
  { key: "previous", label: "Previous period", dashed: true },
]

const orders: Array<{ id: string; name: string; status: string; tone: StatusTone; date: string; amount: string }> = [
  { id: "#3021", name: "Maya Chen", status: "Paid", tone: "success", date: "Nov 9", amount: "$1,240.00" },
  { id: "#3020", name: "Jordan Ellis", status: "Pending", tone: "warning", date: "Nov 9", amount: "$86.50" },
  { id: "#3019", name: "Priya Natarajan", status: "Paid", tone: "success", date: "Nov 8", amount: "$420.00" },
  { id: "#3018", name: "Tom Okafor", status: "Refunded", tone: "neutral", date: "Nov 8", amount: "$64.00" },
  { id: "#3017", name: "Lena Fischer", status: "Paid", tone: "success", date: "Nov 7", amount: "$2,980.00" },
]

export function AdminScreen() {
  const [active, setActive] = useState("Overview")
  const item = (label: string, icon: React.ReactNode, badge?: number) => ({
    label,
    icon,
    badge,
    active: active === label,
    onSelect: () => setActive(label),
  })

  return (
    <AppShell
      brand={
        <AppBrand
          name="Console"
          subtitle="Personal workspace"
          icon={<SparklesIcon />}
          action={
            <Button variant="ghost" size="icon" aria-label="Switch workspace">
              <ChevronsUpDownIcon />
            </Button>
          }
        />
      }
      nav={[
        {
          label: "Workspace",
          items: [
            item("Overview", <LayoutDashboardIcon />),
            item("Analytics", <ChartColumnIcon />),
            item("Customers", <UsersIcon />),
            item("Orders", <ShoppingBagIcon />, 12),
            item("Messages", <InboxIcon />, 4),
            item("Settings", <SlidersHorizontalIcon />),
          ],
        },
        {
          label: "Projects",
          items: [
            { label: "Website", icon: <StatusDot tone="info" className="mx-[5px]" /> },
            { label: "Mobile app", icon: <StatusDot className="mx-[5px] bg-chart-2" /> },
            { label: "Internal tools", icon: <StatusDot className="mx-[5px] bg-chart-3" /> },
          ],
        },
      ]}
      sidebarExtra={
        <div className="rounded-xl bg-primary-soft p-4.5">
          <UsageMeter label="Storage" percent={68} value="68%" trackClassName="bg-card" />
          <p className="mt-2.5 text-xs font-medium text-muted-foreground">34 of 50 GB used</p>
        </div>
      }
      sidebarFooter={
        <UserChip
          name="Harrison M"
          subtitle="Owner"
          action={
            <Button variant="ghost" size="icon" aria-label="Account menu">
              <EllipsisIcon />
            </Button>
          }
        />
      }
      header={
        <>
          <SearchInput placeholder="Search anything" shortcut="⌘K" wrapperClassName="min-w-50 flex-[0_1_380px]" />
          <div className="flex-1" />
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <BellIcon />
            <span className="absolute top-2.25 right-2.5 size-2 rounded-full bg-chart-3 ring-2 ring-background" />
          </Button>
          <Avatar className="ml-1">
            <AvatarFallback>HM</AvatarFallback>
          </Avatar>
        </>
      }
    >
      <PageHeader
        title="Overview"
        description="How the workspace is doing over the last 30 days."
        actions={
          <>
            <Tabs defaultValue="30d">
              <TabsList aria-label="Date range">
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
                <TabsTrigger value="90d">90d</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline">
              <DownloadIcon />
              Export
            </Button>
            <Button>
              <PlusIcon />
              New report
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5" aria-label="Key numbers">
        <StatCard
          label="Revenue"
          value="$48,210"
          delta="12.4%"
          note="vs last month"
          icon={<DollarSignIcon />}
          data={[22, 24, 23, 27, 26, 29, 31, 30, 34, 33, 37, 40]}
        />
        <StatCard
          label="Active users"
          value="2,834"
          delta="4.1%"
          note="vs last month"
          icon={<UsersIcon />}
          data={[30, 31, 29, 32, 33, 32, 34, 35, 34, 36, 37, 38]}
        />
        <StatCard
          label="Conversion"
          value="3.2%"
          delta="0.4 pt"
          trend="down"
          note="vs last month"
          icon={<TargetIcon />}
          data={[38, 37, 39, 36, 35, 36, 34, 35, 33, 34, 32, 32]}
        />
        <StatCard
          label="Avg. response"
          value="182 ms"
          delta="18 ms"
          trend="down"
          positive
          note="faster"
          icon={<ZapIcon />}
          data={[40, 38, 39, 36, 35, 33, 34, 31, 30, 29, 27, 26]}
        />
      </section>

      <section className="flex flex-wrap gap-5">
        <Card className="min-w-0 flex-[2_1_520px]">
          <CardHeader>
            <CardTitle>Visitors</CardTitle>
            <CardDescription>Daily unique visitors, Oct 11 to Nov 9</CardDescription>
            <CardAction>
              <TrendLegend series={series} />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[26px] font-semibold tracking-[-0.02em] tabular-nums">84,392</span>
              <span className="text-[13px] text-muted-foreground">up 9.8% on the previous 30 days</span>
            </div>
            <TrendChart
              data={visitors}
              xKey="date"
              series={series}
              valueFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : String(v))}
            />
          </CardContent>
        </Card>

        <Card className="min-w-0 flex-[1_1_300px]">
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>Share of visits by channel</CardDescription>
            <CardAction>
              <Button variant="ghost" size="icon" aria-label="More options" className="-mt-2 -mr-2">
                <EllipsisIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-5">
            <BarList
              items={[
                { label: "Direct", value: "32,068", percent: 38 },
                { label: "Search", value: "22,786", percent: 27 },
                { label: "Social", value: "13,503", percent: 16 },
                { label: "Referral", value: "10,127", percent: 12 },
                { label: "Email", value: "5,908", percent: 7 },
              ]}
            />
            <Callout className="mt-auto">Search grew fastest this month, up 4 points.</Callout>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap gap-5">
        <Card className="min-w-0 flex-[2_1_520px] gap-3.5 px-0 pt-6 pb-4">
          <CardHeader className="px-6">
            <CardTitle>Recent orders</CardTitle>
            <CardAction>
              <a href="#admin" className="text-[13px] font-medium text-primary no-underline hover:text-foreground">
                View all
              </a>
            </CardAction>
          </CardHeader>
          <CardContent className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-[13px] text-muted-foreground">{o.id}</TableCell>
                    <TableCell>
                      <UserChip name={o.name} size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={o.tone}>{o.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.date}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{o.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 flex-[1_1_300px]">
          <CardHeader>
            <CardTitle>Team activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              items={[
                { actor: "Maya Chen", action: "published", target: "Pricing page v2", time: "12 min ago" },
                { actor: "Jordan Ellis", action: "commented on", target: "Q4 roadmap", time: "1 hour ago" },
                { actor: "Priya Natarajan", action: "merged", target: "Billing webhooks", time: "3 hours ago" },
                { actor: "Tom Okafor", action: "invited", target: "2 teammates", time: "Yesterday" },
                { actor: "Lena Fischer", action: "closed", target: "8 support tickets", time: "Yesterday" },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </AppShell>
  )
}
