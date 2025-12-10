import { Skeleton } from '../ui/skeleton';

export default function BoardColumnsSkeleton() {
  return (
    <div className="flex items-start gap-4">
      <Skeleton className="w-68 rounded-xl h-80" />
      <Skeleton className="w-68 rounded-xl h-96" />
      <Skeleton className="w-68 rounded-xl h-60" />
      <Skeleton className="w-68 rounded-xl h-60" />
    </div>
  );
}
