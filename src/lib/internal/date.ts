/** Parses a floating `YYYY-MM-DD` date (and optional `HH:MM` time) as local time. `new Date("YYYY-MM-DD")` is UTC. */
export function parseLocalDate(date: string, time = "00:00") {
  const [y, m, d] = date.split("-").map(Number)
  const [h, min] = time.split(":").map(Number)
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0)
}
