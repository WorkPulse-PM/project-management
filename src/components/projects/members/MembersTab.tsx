import MembersTable from '@/components/projects/members/MembersTable';
import { apiBase } from '@/lib/api';
import { authClient } from '@/lib/authClient';
import type { Member } from '@/lib/types/memberTypes';
import { useQuery } from '@tanstack/react-query';
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
    <MembersTable
      members={data}
      loggedInUserId={session?.user.id}
      isLoading={isPending}
    />
  );
}
