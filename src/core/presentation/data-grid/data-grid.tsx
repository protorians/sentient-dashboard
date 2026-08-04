"use client"

import * as React from "react"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import {restrictToVerticalAxis} from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type Row,
    type SortingState,
    type VisibilityState,
    type Table as TanstackTable,
    type OnChangeFn,
    type RowSelectionState,
} from "@tanstack/react-table"
import {
    GripVerticalIcon,
    Columns3Icon,
    ChevronDownIcon,
    ChevronsLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsRightIcon,
    XIcon,
    EllipsisVerticalIcon
} from "lucide-react"

import {Button} from "@/core/presentation/ui/button"
import {Checkbox} from "@/core/presentation/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/core/presentation/ui/dropdown-menu"
import {Label} from "@/core/presentation/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/core/presentation/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/core/presentation/ui/table"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/core/presentation/ui/context-menu"
import {cn} from "@/core/infrastructure/utilities/utils"
import {useEffect} from "react";
import {DataGridEmpty} from "@/core/presentation/data-grid/data-grid-empty";

export interface BulkAction<TData> {
    /**
     * Unique identifier for the action
     */
    id: string
    /**
     * Display label for the action
     */
    label: string
    /**
     * Callback when action is triggered
     */
    onExecute: (selectedRows: TData[]) => void | Promise<void>
    /**
     * Optional icon for the action button
     */
    icon?: React.ReactNode
    /**
     * Variant of the button (e.g., 'destructive')
     */
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
}

export interface RowAction<TData> {
    /**
     * Unique identifier for the action
     */
    id: string
    /**
     * Display label for the action
     */
    label: string
    /**
     * Callback when action is triggered
     */
    onExecute: (row: TData) => void | Promise<void>
    /**
     * Optional icon for the action item
     */
    icon?: React.ReactNode
    /**
     * Variant of the item (e.g., 'destructive')
     */
    variant?: "default" | "destructive"
    /**
     * Whether to show the action in the context menu. Defaults to true.
     */
    showInContextMenu?: boolean
}

export interface DataGridProps<TData> {
    /**
     * Data to display in the grid
     */
    data: TData[]
    /**
     * Column definitions
     */
    columns: ColumnDef<TData, any>[]
    /**
     * Function to get a unique ID for each row. Required for DND and selection.
     */
    getRowId: (row: TData) => string
    /**
     * Callback called when data is reordered (if DND is enabled)
     */
    onDataReorder?: (newData: TData[]) => void
    /**
     * Enable drag and drop row reordering
     */
    enableDnd?: boolean
    /**
     * Enable row selection
     */
    enableSelection?: boolean
    /**
     * Callback for row selection change
     */
    onRowSelectionChange?: OnChangeFn<RowSelectionState>
    /**
     * Initial row selection state
     */
    rowSelection?: RowSelectionState
    /**
     * Enable bulk actions bar
     */
    // enableBulkActions?: boolean
    /**
     * Bulk actions available when rows are selected
     */
    bulkActions?: BulkAction<TData>[]
    /**
     * Enable context menu on rows
     */
    // enableRowActions?: boolean
    /**
     * Actions available in the row context menu
     */
    actions?: (row: TData) => RowAction<TData>[]
    /**
     * Enable column visibility toggling
     */
    enableColumnVisibility?: boolean
    /**
     * Enable pagination
     */
    enablePagination?: boolean
    /**
     * Enable manual pagination (server-side)
     */
    manualPagination?: boolean
    /**
     * Total page count for manual pagination
     */
    pageCount?: number
    /**
     * Callback for pagination change
     */
    onPaginationChange?: OnChangeFn<import("@tanstack/react-table").PaginationState>
    /**
     * Current pagination state
     */
    pagination?: import("@tanstack/react-table").PaginationState
    /**
     * Available page size options
     */
    pageSizeOptions?: number[]
    /**
     * Initial page size
     */
    initialPageSize?: number
    /**
     * Custom toolbar content (placed above the table)
     */
    toolbar?: (table: TanstackTable<TData>) => React.ReactNode
    /**
     * Additional class name for the table wrapper
     */
    className?: string
    /**
     * Additional class name for the outer container
     */
    containerClassName?: string
    /**
     * If true, the table header will be sticky
     */
    stickyHeader?: boolean
}

export interface DataGridTableMeta<TData> {
    /**
     * Returns the row actions declared on the DataGrid for a given row.
     * Accessible from cell/header renders via `table.options.meta.getRowActions(row)`.
     */
    getRowActions: (row: TData) => RowAction<TData>[]
}

/**
 * Generic utility to retrieve, from any column cell render, the row actions
 * declared on the DataGrid via the `actions` prop.
 *
 * @example
 * cell: ({row, table}) => {
 *     const actions = getRowActions(table, row.original)
 *     const edit = actions.find(a => a.id === "edit")
 *     return <Button onClick={() => edit?.onExecute(row.original)}>Modifier</Button>
 * }
 */
export function getDataGridActions<TData>(table: TanstackTable<TData>, row: TData): RowAction<TData>[] {
    const meta = table?.options?.meta as DataGridTableMeta<TData> | undefined
    return meta?.getRowActions?.(row) ?? []
}

/**
 * Generic utility to retrieve a single row action by its id, if it exists.
 *
 * @example
 * cell: ({row, table}) => {
 *     const edit = getRowAction(table, row.original, "edit")
 *     return edit && <Button onClick={() => edit.onExecute(row.original)}>Modifier</Button>
 * }
 */
export function getDataGridAction<TData>(
    table: TanstackTable<TData>,
    row: TData,
    actionId: string,
): RowAction<TData> | undefined {
    return getDataGridActions(table, row).find(action => action.id === actionId)
}

// Internal component for the drag handle
function DragHandle({id}: { id: UniqueIdentifier }) {
    const {attributes, listeners} = useSortable({id})

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:bg-transparent"
        >
            <GripVerticalIcon className="size-3 text-muted-foreground"/>
            <span className="sr-only">Drag to reorder</span>
        </Button>
    )
}

interface RowActionMenuProps<TData> {
    children: React.ReactNode
    row: Row<TData>
    enableRowActions?: boolean
    rowActions?: (row: TData) => RowAction<TData>[]
}

function RowActionMenu<TData>(
    {
        children,
        row,
        enableRowActions,
        rowActions,
    }: RowActionMenuProps<TData>) {
    if (!enableRowActions || !rowActions) return <>{children}</>

    const actions = rowActions(row.original).filter(action => action.showInContextMenu !== false)
    if (actions.length === 0) return <>{children}</>

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
                {actions.map((action) => (
                    <ContextMenuItem
                        key={action.id}
                        onClick={() => action.onExecute(row.original)}
                        variant={action.variant}
                    >
                        {action.icon}
                        {action.label}
                    </ContextMenuItem>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    )
}

// Internal component for draggable rows
function DraggableRow<TData>({
                                 row,
                                 enableRowActions,
                                 rowActions,
                             }: {
    row: Row<TData>
    enableRowActions?: boolean
    rowActions?: (row: TData) => RowAction<TData>[]
}) {
    const {transform, transition, setNodeRef, isDragging} = useSortable({
        id: row.id,
    })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
    }

    return (
        <RowActionMenu
            row={row}
            enableRowActions={enableRowActions}
            rowActions={rowActions}
        >
            <TableRow
                data-state={row.getIsSelected() && "selected"}
                data-dragging={isDragging}
                ref={setNodeRef}
                className="relative z-0 data-[dragging=true]:z-1 data-[dragging=true]:opacity-80"
                style={style}
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
        </RowActionMenu>
    )
}

/**
 * DataGrid component for displaying and managing tabular data.
 * Built with @tanstack/react-table and @dnd-kit.
 */
export function DataGrid<TData>(
    {
        data: initialData,
        columns: userColumns,
        getRowId,
        onDataReorder,
        enableDnd = false,
        enableSelection = false,
        onRowSelectionChange,
        rowSelection: initialRowSelection = {},
        // enableBulkActions = false,
        bulkActions = [],
        // enableRowActions = false,
        actions,
        enableColumnVisibility = true,
        enablePagination = true,
        manualPagination = false,
        pageCount,
        onPaginationChange: onPaginationChangeProp,
        pagination: paginationProp,
        pageSizeOptions = [10, 20, 30, 40, 50],
        initialPageSize = 10,
        toolbar,
        className,
        containerClassName,
        stickyHeader = true,
    }: DataGridProps<TData>) {
    // We manage internal data state to support DND reordering
    const [data, setData] = React.useState(() => initialData)
    const enableRowActions = typeof actions !== 'undefined'
    const enableBulkActions = typeof bulkActions !== 'undefined'

    React.useEffect(() => {
        setData(initialData)
    }, [initialData])

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialRowSelection)
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [internalPagination, setInternalPagination] = React.useState({
        pageIndex: 0,
        pageSize: initialPageSize,
    })

    const pagination = paginationProp || internalPagination
    const onPaginationChange = onPaginationChangeProp || setInternalPagination
    const [isExecutingAction, setIsExecutingAction] = React.useState(false)

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(getRowId) || [],
        [data, getRowId]
    )

    // Merge user columns with optional feature columns (selection, dnd, actions)
    const columns = React.useMemo(() => {
        const cols = [...userColumns]

        if (enableSelection) {
            cols.unshift({
                id: "select",
                header: ({table}) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() && "indeterminate")
                            }
                            onCheckedChange={(value) => {
                                table.toggleAllPageRowsSelected(!!value)
                            }}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({row}) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => {
                                row.toggleSelected(!!value)
                            }}
                            aria-label="Select row"
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            })
        }

        if (enableDnd) {
            cols.unshift({
                id: "drag",
                header: () => null,
                cell: ({row}) => <DragHandle id={getRowId(row.original)}/>,
                enableHiding: false,
            })
        }

        if (enableRowActions && actions) {
            const hasActionsColumn = cols.some(col => col.id === "actions")
            if (!hasActionsColumn) {
                cols.push({
                    id: "actions",
                    cell: ({row}) => {
                        const rowActions = actions(row.original)
                        if (rowActions.length === 0) return null

                        return (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex size-8 text-muted-foreground data-[state=open]:bg-muted ml-auto"
                                        size="icon"
                                    >
                                        <EllipsisVerticalIcon className="size-4"/>
                                        <span className="sr-only">Ouvrir le menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {rowActions.map((action, index) => (
                                        <React.Fragment key={action.id}>
                                            {index > 0 && action.variant === "destructive" && rowActions[index - 1].variant !== "destructive" && (
                                                <DropdownMenuSeparator/>
                                            )}
                                            <DropdownMenuItem
                                                onSelect={() => action.onExecute(row.original)}
                                                variant={action.variant}
                                            >
                                                {action.icon}
                                                {action.label}
                                            </DropdownMenuItem>
                                        </React.Fragment>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    },
                    enableSorting: false,
                    enableHiding: false,
                })
            }
        }

        return cols
    }, [userColumns, enableSelection, enableDnd, enableRowActions, actions, getRowId])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => getRowId(row),
        enableRowSelection: enableSelection,
        onRowSelectionChange: (updater) => {
            setRowSelection(updater)
            onRowSelectionChange?.(updater)
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination,
        pageCount,
        meta: {
            getRowActions: (row) => (actions ? actions(row) : []),
        } satisfies DataGridTableMeta<TData>,
    })

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event
        if (active && over && active.id !== over.id) {
            const oldIndex = dataIds.indexOf(active.id)
            const newIndex = dataIds.indexOf(over.id)
            const newData = arrayMove(data, oldIndex, newIndex)
            setData(newData)
            onDataReorder?.(newData)
        }
    }

    const sortableId = React.useId()
    const model = table?.getRowModel()

    const selectedRows = React.useMemo(() => {
        const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key])
        return model?.rows
            .filter(row => selectedIds.includes(row.id))
            .map(row => row.original) || []
    }, [rowSelection, model?.rows])

    const handleBulkAction = async (action: BulkAction<TData>) => {
        setIsExecutingAction(true)
        try {
            await action.onExecute(selectedRows)
            setRowSelection({})
        } finally {
            setIsExecutingAction(false)
        }
    }

    const handleClearSelection = () => {
        setRowSelection({})
    }

    return (
        <div className={cn("flex w-full flex-col gap-6", containerClassName)}>
            {(toolbar || enableColumnVisibility) && (
                <div className="flex items-center justify-between ">
                    <div className="flex items-center gap-2">
                        {toolbar?.(table)}
                    </div>
                    <div className="flex items-center gap-2">
                        {enableColumnVisibility && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Columns3Icon data-icon="inline-start"/>
                                        Colonnes
                                        <ChevronDownIcon data-icon="inline-end"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {table
                                        .getAllColumns()
                                        .filter(
                                            (column) =>
                                                typeof column.accessorFn !== "undefined" &&
                                                column.getCanHide()
                                        )
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    // className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(!!value)
                                                    }
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            )}

            {enableBulkActions && selectedRows.length > 0 && (
                <div
                    className="flex items-center gap-3 rounded-xl p-4 bg-background-400/10 border border-background-400/30 backdrop-blur-2xl">
                    <div className="flex-1 text-sm font-medium text-foreground">
                        {selectedRows.length} ligne(s) sélectionnée(s)
                    </div>
                    <div className="flex items-center gap-2">
                        {bulkActions.map((action) => (
                            <Button
                                key={action.id}
                                size="sm"
                                variant={action.variant || "default"}
                                onClick={() => handleBulkAction(action)}
                                disabled={isExecutingAction}
                            >
                                {action.icon}
                                {action.label}
                            </Button>
                        ))}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleClearSelection}
                            disabled={isExecutingAction}
                        >
                            <XIcon className="size-4"/>
                            <span className="sr-only">Clear selection</span>
                        </Button>
                    </div>
                </div>
            )}

            <div className={cn("overflow-hidden rounded-lg border", className)}>
                {enableDnd ? (
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader className={cn(stickyHeader && "sticky top-0 z-1 bg-muted")}>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {model?.rows?.length ? (
                                    <SortableContext
                                        items={dataIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {model?.rows.map((row) => (
                                            <DraggableRow
                                                key={row.id}
                                                row={row}
                                                enableRowActions={enableRowActions}
                                                rowActions={actions}
                                            />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            <DataGridEmpty/>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                ) : (
                    <Table>
                        <TableHeader className={cn(stickyHeader && "sticky top-0 z-1 bg-muted")}>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {model?.rows?.length ? (
                                model?.rows.map((row) => (
                                    <RowActionMenu
                                        key={row.id}
                                        row={row}
                                        enableRowActions={enableRowActions}
                                        rowActions={actions}
                                    >
                                        <TableRow
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </RowActionMenu>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        <DataGridEmpty/>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {enablePagination && (
                <div className="flex items-center justify-between ">
                    <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} ligne(s) sélectionnées.
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Ligne par page
                            </Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                    <SelectValue
                                        placeholder={table.getState().pagination.pageSize}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    <SelectGroup>
                                        {pageSizeOptions.map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Page {table.getState().pagination.pageIndex + 1} sur{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Aller à la première page</span>
                                <ChevronsLeftIcon/>
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Aller à la page précédente</span>
                                <ChevronLeftIcon/>
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Aller à la page suivante</span>
                                <ChevronRightIcon/>
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Aller à la dernière page</span>
                                <ChevronsRightIcon/>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
