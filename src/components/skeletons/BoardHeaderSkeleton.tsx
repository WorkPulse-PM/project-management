import { Skeleton } from '../ui/skeleton';

export default function BoardHeaderSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <Skeleton className="h-10 w-1/2 rounded-md" />
      <div>
        <Skeleton className="h-10 w-30 rounded-md" />
      </div>
    </div>
  );
}
