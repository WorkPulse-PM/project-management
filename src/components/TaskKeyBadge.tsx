import { Bookmark } from 'lucide-react';
import { Badge } from './ui/badge';

export default function TaskKeyBadge({ taskKey }: { taskKey?: string }) {
  if (!taskKey) return null;
  return (
    <Badge variant="soft" size="20">
      <Bookmark className="size-4" />
      {taskKey}
    </Badge>
  );
}
