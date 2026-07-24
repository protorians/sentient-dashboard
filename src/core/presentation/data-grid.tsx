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
    XIcon
} from "lucide-react"

import {Button} from "@/core/presentation/ui/button"
import {Checkbox} from "@/core/presentation/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
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
import {cn} from "@/core/infrastructure/utilities/utils"
import {useEffect} from "react";

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
    enableBulkActions?: boolean
    /**
     * Bulk actions available when rows are selected
     */
    bulkActions?: BulkAction<TData>[]
    /**
     * Enable column visibility toggling
     */
    enableColumnVisibility?: boolean
    /**
     * Enable pagination
     */
    enablePagination?: boolean
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

// Internal component for draggable rows
function DraggableRow<TData>({
                                 row
                             }: {
    row: Row<TData>
}) {
    const {transform, transition, setNodeRef, isDragging} = useSortable({
        id: row.id,
    })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
    }

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={style}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
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
        enableBulkActions = false,
        bulkActions = [],
        enableColumnVisibility = true,
        enablePagination = true,
        pageSizeOptions = [10, 20, 30, 40, 50],
        initialPageSize = 10,
        toolbar,
        className,
        containerClassName,
        stickyHeader = true,
    }: DataGridProps<TData>) {
    // We manage internal data state to support DND reordering
    const [data, setData] = React.useState(() => initialData)

    React.useEffect(() => {
        setData(initialData)
    }, [initialData])

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialRowSelection)
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: initialPageSize,
    })
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

    // Merge user columns with optional feature columns (selection, dnd)
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

        return cols
    }, [userColumns, enableSelection, enableDnd, getRowId])

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
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
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
                            <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-muted")}>
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
                                            <DraggableRow key={row.id} row={row}/>
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                ) : (
                    <Table>
                        <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-muted")}>
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
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
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
                            Page {table.getState().pagination.pageIndex + 1} of{" "}
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
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeftIcon/>
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon/>
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon/>
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRightIcon/>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
