import { IconButton } from '@/components/ui/button';
import { getMenuColors } from '@/lib/colorUtils';
import type { BoardColumn } from '@/lib/types/projectTypes';
import { EllipsisVertical } from 'lucide-react';

export default function ColumnHeader({ column }: { column: BoardColumn }) {
  return (
    <section className="flex items-center justify-between">
      <h2 className="text-base font-medium truncate text-black-inverse px-3">
        {column.name} {column.tasks.length}
      </h2>
      <IconButton size="28" color={getMenuColors(column.name)} variant="ghost">
        <EllipsisVertical />
      </IconButton>
    </section>
  );
}
