import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/components/ui/avatar-group';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Member } from '@/lib/types/memberTypes';
import { cn } from '@/lib/utils';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Ellipsis,
  Pen,
  Settings,
} from 'lucide-react';

const columns: ColumnDef<Member>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       size="sm"
  //       className="flex items-center justify-start"
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       size="sm"
  //       checked={row.getIsSelected()}
  //       onCheckedChange={value => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   size: 28,
  //   enableSorting: false,
  // },
  {
    header: '#',
    cell: ({ row }) => <div>{row.index + 1}</div>,
    size: 20,
  },
  {
    header: 'User',
    accessorKey: 'user',
    cell: ({ row }) => {
      const userDetails = row.getValue('user') as Member['user'];
      return (
        <div className="flex items-center gap-3">
          <Avatar rounded="square" size="36">
            <AvatarImage src={userDetails.image} />
            <AvatarFallback>{getInitials(userDetails.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-fg">{userDetails.name}</p>
            <p className="text-xs font-normal text-fg-secondary">
              {userDetails.email}
            </p>
          </div>
        </div>
      );
    },
    size: 250,
  },
  {
    header: 'Joined',
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const joinedAt = row.getValue('createdAt') as string;
      return (
        <p className="text-sm font-normal text-fg-secondary">
          {formatDistanceToNow(joinedAt, {
            addSuffix: true,
          })}
        </p>
      );
    },
    size: 140,
  },
  {
    header: 'Invited by',
    accessorKey: 'inviteByUser',
    cell: ({ row }) => {
      const inviteBy = row.getValue('inviteByUser') as Member['inviteByUser'];
      return (
        <div className="flex items-center gap-1">
          <Avatar size="32" className="border-2 border-bg hover:z-10">
            <AvatarImage src={inviteBy.image} />
            <AvatarFallback className="text-xs">
              {getInitials(inviteBy.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm text-fg-secondary">{inviteBy.name}</p>
          </div>
        </div>
      );
    },
    size: 140,
  },
  {
    header: 'Edit',
    cell: () => {
      return (
        <Dropdown>
          <DropdownTrigger className="flex items-center justify-center w-full">
            <Ellipsis size={20} />
          </DropdownTrigger>
          <DropdownContent className="w-fit">
            <DropdownItem>
              <Pen />
              Edit
            </DropdownItem>
            <DropdownItem>
              <Settings />
              Delete
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      );
    },
    size: 60,
  },
];

export default function MembersTable({
  members = [],
  isLoading,
}: {
  members?: Member[];
  loggedInUserId?: string;
  isLoading?: boolean;
}) {
  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  });

  return (
    <div className="flex flex-col w-full gap-4 overflow-auto">
      <div className="overflow-y-scroll border rounded-md bg-background no-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-60">
            <Spinner />
          </div>
        ) : (
          <Table className="table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="h-11"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                'flex h-full cursor-pointer select-none items-center justify-between gap-2'
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={e => {
                              if (
                                header.column.getCanSort() &&
                                (e.key === 'Enter' || e.key === ' ')
                              ) {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }}
                            tabIndex={
                              header.column.getCanSort() ? 0 : undefined
                            }
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: (
                                <ChevronUpIcon
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                              desc: (
                                <ChevronDownIcon
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  aria-hidden="true"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
    </div>
  );
}
