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
import { usePermission } from '@/hooks/use-permission';
import { apiBase } from '@/lib/api';
import type { Role } from '@/lib/types/roleTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
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
  const { can } = usePermission();
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      await apiBase.post(`/rbac/${projectId}/role`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project', projectId, 'roles'],
      });
      setIsCreateRoleOpen(false);
      setNewRoleName('');
      setNewRoleDescription('');
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role');
    },
  });

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;

    createRoleMutation.mutate({
      name: newRoleName,
      description: newRoleDescription,
    });
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
          {can('role:create') && (
            <Button
              className="w-full flex gap-2"
              variant="soft"
              onClick={() => setIsCreateRoleOpen(true)}
            >
              <Plus className="h-4 w-4" /> Create New Role
            </Button>
          )}
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
            <Button
              onClick={handleCreateRole}
              disabled={!newRoleName.trim() || createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
