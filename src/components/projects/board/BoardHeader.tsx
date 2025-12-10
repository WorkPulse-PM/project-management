import CreateTaskForm from '@/components/projects/CreateTaskForm';
import BoardHeaderSkeleton from '@/components/skeletons/BoardHeaderSkeleton';
import AvatarGroup from '@/components/ui/avatar-group';
import { Button, IconButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { apiBase } from '@/lib/api';
import type { Project } from '@/lib/types/projectTypes';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, UserRoundPlusIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function BoardHeader() {
  const { projectId } = useParams();

  const { data: project, isPending: isLoadingProject } = useQuery({
    enabled: !!projectId,
    select: res => res.data,
    queryKey: ['projects', projectId],
    // staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      const data = await apiBase.get<Project>(`/projects/${projectId}`);
      return data;
    },
  });

  if (isLoadingProject) return <BoardHeaderSkeleton />;
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-fg">{project?.name}</h2>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          {project?.members && (
            <AvatarGroup size="40" avatars={project.members} />
          )}
          <IconButton
            size={'32'}
            className="rounded-full"
            variant={'outline'}
            color="neutral"
          >
            <UserRoundPlusIcon size={25} />
          </IconButton>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto gap-1 rounded-xl"
            backdrop="overlay"
          >
            <CreateTaskForm projectId={projectId!} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
