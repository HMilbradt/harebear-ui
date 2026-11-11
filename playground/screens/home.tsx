import {
  ActivityIcon,
  CameraIcon,
  CloudIcon,
  FilmIcon,
  HardDriveIcon,
  HouseIcon,
  LayoutGridIcon,
  NetworkIcon,
  PlusIcon,
  RefreshCwIcon,
  ServerIcon,
  ShieldIcon,
  WorkflowIcon,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  Heading,
  LinkTile,
  Metric,
  MetricGroup,
  SearchInput,
  ShowMore,
  Sparkline,
  Stack,
  StatusBars,
  type StatusTone,
  StatusDot,
  Text,
  ThemeToggle,
  TrendChart,
  UsageMeter,
} from "@/index"

const releases = [
  { app: "Plex", name: "Media Server 1.42.2", when: "2 hours ago" },
  { app: "Sonarr", name: "v4.0.15 stable", when: "Yesterday" },
  { app: "Home Assistant", name: "2026.11.1", when: "3 days ago" },
  { app: "Vaultwarden", name: "1.37.5", when: "Last week" },
  { app: "Portainer", name: "2.45.3 LTS", when: "Last week" },
]

const services: Array<{ name: string; host: string; icon: React.ReactNode; tone: StatusTone; state: string }> = [
  { name: "Proxmox", host: "beast.lan:8006", icon: <ServerIcon />, tone: "success", state: "12 ms" },
  { name: "Immich", host: "photos.lan", icon: <CameraIcon />, tone: "success", state: "24 ms" },
  { name: "Jellyfin", host: "media.lan:8096", icon: <FilmIcon />, tone: "success", state: "18 ms" },
  { name: "Home Assistant", host: "ha.lan:8123", icon: <HouseIcon />, tone: "success", state: "9 ms" },
  { name: "AdGuard", host: "dns.lan", icon: <ShieldIcon />, tone: "success", state: "4 ms" },
  { name: "TrueNAS", host: "nas.lan", icon: <HardDriveIcon />, tone: "warning", state: "310 ms" },
  { name: "n8n", host: "flows.lan:5678", icon: <WorkflowIcon />, tone: "success", state: "31 ms" },
  { name: "Grafana", host: "grafana.lan:3000", icon: <ActivityIcon />, tone: "success", state: "22 ms" },
  { name: "Nextcloud", host: "cloud.lan", icon: <CloudIcon />, tone: "danger", state: "down" },
]

const wave = (n: number, base: number, amp: number, k: number) =>
  Array.from({ length: n }, (_, i) =>
    Math.max(1, Math.round(base + amp * Math.sin(i / k) + (amp / 2) * Math.cos(i * 1.7))),
  )

const pings: Array<{ name: string; host: string; ms: string; data: Array<{ value: number; tone: StatusTone }> }> = [
  ["Router", "10.0.0.1", 2, 1],
  ["Beast", "10.0.0.10", 12, 4],
  ["NAS", "10.0.0.20", 140, 120],
  ["Pi-hole", "10.0.0.53", 4, 2],
  ["Cloudflare", "1.1.1.1", 14, 5],
  ["Office AP", "10.0.0.31", 8, 3],
].map(([name, host, base, amp]) => {
  const d = wave(20, base as number, amp as number, 2.4)
  return {
    name: name as string,
    host: host as string,
    ms: `${d.at(-1)} ms`,
    data: d.map((v) => ({ value: v, tone: v > 200 ? "danger" : v > 100 ? "warning" : "success" })),
  }
})

const network = Array.from({ length: 30 }, (_, i) => ({
  t: i,
  down: Math.round(150 + 40 * Math.sin(i / 3) + 20 * Math.cos(i * 1.3)),
  up: Math.round(20 + 6 * Math.sin(i / 2.5 + 1)),
}))

const servers = [
  {
    name: "Beast",
    sub: "Proxmox · Ryzen 9 7950X",
    uptime: "41d",
    cpu: wave(24, 34, 14, 3),
    meters: [
      { label: "Memory", value: "71 GB", detail: "of 128 GB", pct: 55 },
      { label: "Storage", value: "3.1 TB", detail: "of 4 TB", pct: 78, color: "var(--warning)" },
      { label: "GPU", value: "38%", detail: "RTX 4070", pct: 38 },
    ],
  },
  {
    name: "Shed NAS",
    sub: "TrueNAS · 6 × 12 TB",
    uptime: "112d",
    cpu: wave(24, 12, 6, 2),
    meters: [
      { label: "Pool", value: "41 TB", detail: "of 54 TB", pct: 76 },
      { label: "Memory", value: "22 GB", detail: "of 64 GB", pct: 34 },
      { label: "ARC hit", value: "94%", detail: "", pct: 94 },
    ],
  },
]

const bookmarks = [
  {
    label: "Daily",
    items: [
      ["Gmail", "mail.google.com"],
      ["Calendar", "calendar.google.com"],
      ["Linear", "linear.app"],
      ["GitHub", "github.com"],
    ],
  },
  {
    label: "Homelab",
    items: [
      ["Proxmox docs", "pve.proxmox.com"],
      ["r/homelab", "reddit.com"],
      ["Awesome Selfhosted", "github.com"],
      ["ServeTheHome", "servethehome.com"],
    ],
  },
  {
    label: "Reading",
    items: [
      ["Hacker News", "news.ycombinator.com"],
      ["LWN", "lwn.net"],
      ["Ars Technica", "arstechnica.com"],
      ["The Verge", "theverge.com"],
    ],
  },
  {
    label: "Tools",
    items: [
      ["Excalidraw", "excalidraw.com"],
      ["regex101", "regex101.com"],
      ["crontab.guru", "crontab.guru"],
      ["Can I use", "caniuse.com"],
    ],
  },
]

export function HomeScreen() {
  return (
    <div className="mx-auto flex max-w-320 flex-col gap-7 px-4 pt-10 pb-14 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="font-medium text-muted-foreground">Monday, November 9</p>
          <h1 className="text-[34px] leading-[1.15] font-semibold tracking-[-0.025em]">Good evening, Harrison</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-8 gap-2 px-3.5">
            <StatusDot tone="success" />8 of 9 services healthy
          </Badge>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Edit dashboard">
            <LayoutGridIcon />
          </Button>
        </div>
      </header>

      <SearchInput size="lg" shortcut="/" placeholder="Search the web, or jump to a service or bookmark" />

      <section className="flex flex-wrap items-stretch gap-5">
        <Card className="min-w-0 flex-[2_1_560px]">
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardAction>
              <a href="#home" className="text-[13px] font-medium text-primary no-underline hover:text-foreground">
                Manage
              </a>
            </CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
            {services.map((s) => (
              <LinkTile
                key={s.name}
                href="#home"
                title={s.name}
                subtitle={s.host}
                icon={s.icon}
                status={{ tone: s.tone, label: s.state }}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="min-w-0 flex-[1_1_340px]">
          <CardHeader>
            <CardTitle>Ping</CardTitle>
            <p className="text-xs text-muted-foreground">Last 20 checks, every 30 s</p>
            <CardAction>
              <Button variant="ghost" size="icon" aria-label="Run checks now" className="-mr-2">
                <RefreshCwIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {pings.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col leading-snug">
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{p.host}</span>
                </div>
                <StatusBars data={p.data} />
                <span className="w-14 text-right font-mono text-[13px] font-medium tabular-nums">{p.ms}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap items-stretch gap-5">
        <Card className="@container min-w-0 flex-[1_1_320px]">
          <CardHeader>
            <CardTitle>Speed test</CardTitle>
          </CardHeader>
          <CardContent>
            <Stack gap="md">
              <MetricGroup>
                <Metric label="Download" value="111.9" unit="Mbps" delta={-3.2} />
                <Metric label="Upload" value="103.7" unit="Mbps" delta={56.6} />
                <Metric label="Ping" value="21" unit="ms" delta={-34.5} lowerIsBetter />
              </MetricGroup>
              <Text size="xs" tone="muted">
                Against the 30 day average
              </Text>
            </Stack>
          </CardContent>
        </Card>
        <Card className="min-w-0 flex-[2_1_480px]">
          <CardHeader>
            <CardTitle>Releases</CardTitle>
          </CardHeader>
          <CardContent>
            <ShowMore initial={3}>
              {releases.map((r) => (
                <Stack key={r.name} gap="none">
                  <Heading level={4}>{r.app}</Heading>
                  <Text weight="medium">{r.name}</Text>
                  <Text size="xs" tone="muted">
                    {r.when}
                  </Text>
                </Stack>
              ))}
            </ShowMore>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-wrap gap-5">
        {servers.map((sv) => (
          <Card key={sv.name} className="min-w-0 flex-[1_1_320px] gap-5">
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary">
                  <ServerIcon className="size-[18px]" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col leading-snug">
                  <h2 className="text-base font-semibold">{sv.name}</h2>
                  <span className="text-xs text-muted-foreground">{sv.sub}</span>
                </div>
                <Badge variant="secondary" className="tabular-nums">
                  up {sv.uptime}
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">CPU, last 24 h</span>
                  <span className="font-semibold tabular-nums">{sv.cpu.at(-1)}%</span>
                </div>
                <Sparkline data={sv.cpu} min={0} max={100} className="h-14" />
              </div>
              <div className="flex flex-col gap-3.5">
                {sv.meters.map((m) => (
                  <UsageMeter
                    key={m.label}
                    label={<span className="font-normal text-muted-foreground">{m.label}</span>}
                    percent={m.pct}
                    value={m.value}
                    detail={m.detail}
                    color={m.color}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="min-w-0 flex-[1_1_320px] gap-4.5">
          <CardContent className="flex flex-1 flex-col gap-4.5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary">
                <NetworkIcon className="size-[18px]" />
              </span>
              <div className="flex flex-1 flex-col leading-snug">
                <h2 className="text-base font-semibold">Network</h2>
                <span className="text-xs text-muted-foreground">WAN throughput, last hour</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Download", "184", "var(--chart-1)"],
                ["Upload", "22", "var(--chart-2)"],
              ].map(([label, v, c]) => (
                <div key={label} className="flex flex-col gap-0.5 rounded-lg bg-muted px-3.5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span className="h-[3px] w-3 rounded-[3px]" style={{ background: c }} />
                    {label}
                  </span>
                  <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums">
                    {v} <span className="text-[13px] font-medium text-muted-foreground">Mb/s</span>
                  </span>
                </div>
              ))}
            </div>
            <TrendChart
              className="mt-auto"
              data={network}
              xKey="t"
              height={150}
              hideYAxis
              xFormatter={(t) => (t === 0 ? "60 min ago" : t === 29 ? "now" : "")}
              series={[
                { key: "down", label: "Download" },
                { key: "up", label: "Upload" },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <Card className="gap-4.5 px-7">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Bookmarks</h2>
          <Button variant="ghost" size="sm" className="-mr-2.5">
            <PlusIcon />
            Add
          </Button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-10 gap-y-6">
          {bookmarks.map((g) => (
            <div key={g.label} className="flex flex-col gap-1">
              <span className="pb-1.5 text-xs font-medium text-muted-foreground">{g.label}</span>
              {g.items.map(([name, host]) => (
                <a
                  key={name}
                  href="#home"
                  className="group -mx-2.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-foreground no-underline transition-colors hover:bg-muted"
                >
                  <span className="grid size-6.5 place-items-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground group-hover:bg-primary-soft group-hover:text-primary">
                    {name?.[0]}
                  </span>
                  <span className="flex-1">{name}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{host}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
