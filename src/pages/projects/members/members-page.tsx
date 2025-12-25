import InvitationsHistoryTab from '@/components/projects/members/InvitationsHistoryTab';
import InviteMemberModal from '@/components/projects/members/InviteMemberModal';
import MembersTab from '@/components/projects/members/MembersTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users } from 'lucide-react';
import { useState } from 'react';
import { useQueryState } from 'nuqs';

export default function MembersPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'members',
  });
  return (
    <>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
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
          <MembersTab openInviteModal={() => setIsInviteModalOpen(true)} />
        </TabsContent>
        <TabsContent value="invitations">
          <InvitationsHistoryTab
            openInviteModal={() => setIsInviteModalOpen(true)}
          />
        </TabsContent>
      </Tabs>
      {isInviteModalOpen && (
        <InviteMemberModal
          open={isInviteModalOpen}
          onOpenChange={open => setIsInviteModalOpen(open)}
        />
      )}
    </>
  );
}
