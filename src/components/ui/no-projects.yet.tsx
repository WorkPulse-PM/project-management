import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyAction,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NoProjectsYet() {
  return (
    <Empty>
      <EmptyMedia
        variant="icon"
        className="border-soft shadow-2xs rounded-full border"
      >
        <span className="bg-bg border-soft shadow-2xs flex items-center justify-center rounded-[inherit] border p-3.5">
          <Database />
        </span>
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You don’t have any projects yet. Create your first one to get started
        </EmptyDescription>
      </EmptyHeader>
      <EmptyAction>
        <Button asChild>
          <Link to={'/projects/create'}>Create Project</Link>
        </Button>
      </EmptyAction>
    </Empty>
  );
}
