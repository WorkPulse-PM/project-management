import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Role } from '@/lib/types/roleTypes';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import RoleListItem from './RoleListItem';

export default function RolesSidebar({
  selectedRoleId,
  roles,
  onRoleSelect,
}: {
  selectedRoleId: string;
  roles: Role[];
  onRoleSelect: (id: string) => void;
}) {
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;

    // const newRole: Role = {
    //   id: newRoleName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    //   name: newRoleName,
    //   description: newRoleDescription || 'No description provided.',
    //   usersCount: 0,
    //   permissions: MOCK_RESOURCES.map(r => ({
    //     ...r,
    //     actions: { create: false, read: true, update: false, delete: false },
    //   })),
    // };

    // setRoles([...roles, newRole]);
    // setSelectedRoleId(newRole.id);
    // setIsCreateRoleOpen(false);
    // setNewRoleName('');
    // setNewRoleDescription('');
  };

  return (
    <>
      <Card className="col-span-1 border-none shadow-none bg-transparent lg:col-span-4 h-full flex flex-col">
        {/* Note: In a real app, I'd probably put the Card styling on the wrapper or internal to be cleaner, 
         but here I want it to blend or stand out. Let's make it a proper card for the list.
     */}
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="w-full flex gap-2"
            variant="soft"
            onClick={() => setIsCreateRoleOpen(true)}
          >
            <Plus className="h-4 w-4" /> Create New Role
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto px-0 space-y-3">
          {filteredRoles.map(role => (
            <RoleListItem
              key={role.id}
              role={role}
              isActive={selectedRoleId === role.id}
              onClick={() => onRoleSelect(role.id)}
            />
          ))}
          {filteredRoles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No roles found.
            </div>
          )}
        </CardContent>
      </Card>
      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role to your organization. You can configure permissions
              after creating it.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g. Content Editor"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                placeholder="Briefly describe what this role does..."
                value={newRoleDescription}
                onChange={e => setNewRoleDescription(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateRoleOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRoleName.trim()}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
