import MembersTable from '@/components/projects/members/MembersTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiBase } from '@/lib/api';
import { authClient } from '@/lib/authClient';
import type { Member } from '@/lib/types/memberTypes';
import { useQuery } from '@tanstack/react-query';
import { Send, UserPlus, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function MembersPage() {
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
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
      {/* <InviteMembersForm /> */}
      <Tabs defaultValue="members">
        <TabsList width={'full'} size={'lg'}>
          <TabsTrigger value="members" className="cursor-pointer">
            <Users />
            Members
          </TabsTrigger>
          <TabsTrigger value="invitations" className="cursor-pointer">
            <Send />
            Invitations history
          </TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <MembersTable
            members={data}
            loggedInUserId={session?.user.id}
            isLoading={isPending}
          />
        </TabsContent>
        <TabsContent value="invitations">
          Change your password here.
        </TabsContent>
      </Tabs>
    </div>
  );
}
