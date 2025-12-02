import MembersTab from '@/components/projects/members/MembersTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, UserPlus, Users } from 'lucide-react';

export default function MembersPage() {
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
          <MembersTab />
        </TabsContent>
        <TabsContent value="invitations">
          Change your password here.
        </TabsContent>
      </Tabs>
    </div>
  );
}
