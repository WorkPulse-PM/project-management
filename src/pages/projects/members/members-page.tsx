import InvitationsHistoryTab from '@/components/projects/members/InvitationsHistoryTab';
import MembersTab from '@/components/projects/members/MembersTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users } from 'lucide-react';

export default function MembersPage() {
  return (
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
        <MembersTab />
      </TabsContent>
      <TabsContent value="invitations">
        <InvitationsHistoryTab />
      </TabsContent>
    </Tabs>
  );
}
