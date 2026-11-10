"use client"

import {
  type ColumnDef,
  type RowData,
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import * as React from "react"
import { SearchInput } from "@/components/admin/search-input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/** Feature set used by DataTable. Use with createDataTableColumnHelper for typed columns. */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic },
})

export type DataTableFeatures = typeof dataTableFeatures
// biome-ignore lint/suspicious/noExplicitAny: column value types vary per column
export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>

/** Typed column helper for DataTable: `const col = createDataTableColumnHelper<Customer>()`. */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

export interface DataTableProps<TData extends RowData> {
  columns: DataTableColumnDef<TData>[]
  data: TData[]
  /** Stable row id. Defaults to the row index. Needed for selection and activeRowId. */
  getRowId?: (row: TData, index: number) => string
  /** Show a search box that filters across all string/number columns. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Extra controls rendered after the search box (filters, sort, actions). */
  toolbar?: React.ReactNode
  /** Adds a checkbox column. */
  selectable?: boolean
  onSelectionChange?: (rows: TData[]) => void
  onRowClick?: (row: TData) => void
  /** Highlights this row (e.g. the one open in a detail panel). */
  activeRowId?: string
  /** Rows per page. 0 disables pagination. Default 10. */
  pageSize?: number
  /** Shown when there are no rows. */
  emptyMessage?: React.ReactNode
  className?: string
}

/**
 * Sortable, searchable, selectable, paginated table. Client-side processing via
 * TanStack Table v9. For server-side data, compose Table primitives with useTable directly.
 */
function DataTable<TData extends RowData>({
  columns: columnsProp,
  data,
  getRowId,
  searchable,
  searchPlaceholder = "Search",
  toolbar,
  selectable,
  onSelectionChange,
  onRowClick,
  activeRowId,
  pageSize = 10,
  emptyMessage = "No results.",
  className,
}: DataTableProps<TData>) {
  const columns = React.useMemo<DataTableColumnDef<TData>[]>(() => {
    if (!selectable) return columnsProp
    const select: DataTableColumnDef<TData> = {
      id: "__select",
      enableSorting: false,
      enableGlobalFilter: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all rows"
          checked={
            table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onClick={(e) => e.stopPropagation()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      ),
    }
    return [select, ...columnsProp]
  }, [columnsProp, selectable])

  const paginate = pageSize > 0
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    globalFilterFn: "includesString",
    initialState: {
      pagination: { pageIndex: 0, pageSize: paginate ? pageSize : Number.MAX_SAFE_INTEGER },
    },
  })

  const rowSelection = table.state.rowSelection
  const onSelectionChangeRef = React.useRef(onSelectionChange)
  onSelectionChangeRef.current = onSelectionChange
  // biome-ignore lint/correctness/useExhaustiveDependencies: fire only when the selection changes
  React.useEffect(() => {
    onSelectionChangeRef.current?.(table.getSelectedRowModel().rows.map((r) => r.original))
  }, [rowSelection])

  const filteredCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize: size } = table.state.pagination
  const pageCount = table.getPageCount()
  const rows = table.getRowModel().rows

  return (
    <div data-slot="data-table" className={cn("flex min-w-0 flex-col gap-4", className)}>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-2.5">
          {searchable && (
            <SearchInput
              wrapperClassName="min-w-50 flex-[0_1_300px]"
              placeholder={searchPlaceholder}
              value={String(table.state.globalFilter ?? "")}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
          )}
          {toolbar}
        </div>
      )}

      <Table className="border-spacing-y-0.5">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()
                const SortIcon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon
                const meta = header.column.columnDef.meta as { align?: "left" | "right" } | undefined
                return (
                  <TableHead
                    key={header.id}
                    className={cn(header.column.id === "__select" && "w-11", meta?.align === "right" && "text-right")}
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "-mx-1 inline-flex items-center gap-1 rounded-sm px-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
                          sorted && "text-foreground",
                        )}
                      >
                        <table.FlexRender header={header} />
                        <SortIcon className={cn("size-3.5", !sorted && "opacity-40")} />
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() || row.id === activeRowId ? "selected" : undefined}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {row.getAllCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as { align?: "left" | "right" } | undefined
                  return (
                    <TableCell key={cell.id} className={cn("py-3", meta?.align === "right" && "text-right")}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {paginate && filteredCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1.5">
          <span className="text-[13px] text-muted-foreground tabular-nums">
            Showing {Math.min(filteredCount, pageIndex * size + 1)}-{Math.min(filteredCount, (pageIndex + 1) * size)} of{" "}
            {filteredCount}
          </span>
          {pageCount > 1 && (
            <nav aria-label="Pagination" className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Previous page"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeftIcon />
              </Button>
              {pageList(pageIndex, pageCount).map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pageIndex ? "secondary" : "ghost"}
                    size="icon-sm"
                    className="tabular-nums"
                    aria-current={p === pageIndex ? "page" : undefined}
                    onClick={() => table.setPageIndex(p)}
                  >
                    {p + 1}
                  </Button>
                ),
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Next page"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRightIcon />
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}

/** Zero-based page indexes with ellipses: 0 1 2 … 27 */
function pageList(current: number, count: number): Array<number | "…"> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i)
  const set = new Set([0, count - 1, current - 1, current, current + 1].filter((p) => p >= 0 && p < count))
  if (current <= 2) for (const p of [1, 2, 3]) set.add(p)
  if (current >= count - 3) for (const p of [count - 4, count - 3, count - 2]) set.add(p)
  const sorted = [...set].sort((a, b) => a - b)
  const out: Array<number | "…"> = []
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1]
    if (i > 0 && prev !== undefined && p - prev > 1) out.push("…")
    out.push(p)
  })
  return out
}

export { DataTable }
