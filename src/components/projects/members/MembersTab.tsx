import MembersTable from '@/components/projects/members/MembersTable';
import { Button } from '@/components/ui/button';
import { apiBase } from '@/lib/api';
import { authClient } from '@/lib/authClient';
import type { Member } from '@/lib/types/memberTypes';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function MembersTab() {
  const { data: session } = authClient.useSession();
  const { projectId } = useParams();
  const { data, isPending } = useQuery({
    queryKey: ['projects', projectId, 'members'],
    enabled: !!projectId,
    select: res => res.data,
    queryFn: async () => {
      const res = await apiBase.get<Member[]>(`/rbac/${projectId}/members`);
      return res;
    },
  });

  return (
    <div className="p-4 mt-4 space-y-6 border rounded-md">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h2 className="text-lg font-bold">Project Members</h2>
          <p className="text-sm text-fg-tertiary">
            Manage who has access to this project.
          </p>
        </div>
        <Button>
          <UserPlus />
          Invite
        </Button>
      </div>
      <MembersTable
        members={data}
        loggedInUserId={session?.user.id}
        isLoading={isPending}
      />
    </div>
  );
}
