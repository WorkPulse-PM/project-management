import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { usePermission } from '@/hooks/use-permission';
import { apiBase } from '@/lib/api';
import type { Permission } from '@/lib/types/permissionTypes';
import type { Role } from '@/lib/types/roleTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Layout, Lock, MoreVertical, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import PermissionGroup from './PermissionGroup';
import RolesSidebar from './RolesSidebar';

type GroupedPermissions = {
  group: string;
  permissions: Permission[];
};

export default function AccessControlPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { can } = usePermission();

  const { data: roles = [] } = useQuery({
    queryKey: ['project', projectId, 'roles'],
    queryFn: async () => {
      const { data } = await apiBase.get<Role[]>(`/rbac/${projectId}/roles`);
      if (!selectedRoleId && data.length > 0) setSelectedRoleId(data[0].id);
      return data;
    },
  });
  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data } = await apiBase.get<GroupedPermissions[]>(
        `/rbac/${projectId}/permissions`
      );
      return data;
    },
  });

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<
    string[]
  >([]);

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const isOwnerRole = selectedRole?.name === 'Owner';

  useEffect(() => {
    if (!selectedRole?.permissions) return;
    setSelectedRolePermissions(selectedRole.permissions.map(p => p.key));
  }, [selectedRole]);

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: string[];
    }) => {
      await apiBase.put(`/rbac/${projectId}/roles/${roleId}/permissions`, {
        permissions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project', projectId, 'roles'],
      });
      toast.success('Permissions updated successfully');
    },
    onError: () => {
      toast.error('Failed to update permissions');
    },
  });

  const handlePermissionCheckedChange = async (key: string) => {
    const isAlreadyChecked = selectedRolePermissions.includes(key);

    let newPermissions: string[] = [];

    if (isAlreadyChecked) {
      newPermissions = selectedRolePermissions.filter(p => p !== key);
    } else {
      newPermissions = [...selectedRolePermissions, key];
    }
    setSelectedRolePermissions(newPermissions);

    // Save changes
    updatePermissionsMutation.mutate({
      roleId: selectedRoleId,
      permissions: newPermissions,
    });
  };

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      await apiBase.delete(`/rbac/${projectId}/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project', projectId, 'roles'],
      });
      toast.success('Role deleted successfully');
      setSelectedRoleId('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    },
  });

  const handleDeleteRole = (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(id);
    }
  };

  const canUpdateRole = can('role:update');

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Access Control</h1>
          <p className="text-muted-foreground">
            Manage roles and permissions for your team.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Placeholder for future action */}
        </div>
      </div>

      <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Sidebar: Role List */}
        <RolesSidebar
          roles={roles}
          selectedRoleId={selectedRoleId}
          onRoleSelect={setSelectedRoleId}
        />

        {/* Main Content: Permissions */}
        <Card className="col-span-1 h-full flex flex-col lg:col-span-8 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{selectedRole?.name}</CardTitle>
                {isOwnerRole && (
                  <Badge variant="soft" color="neutral" className="gap-1">
                    <Lock className="h-3 w-3" /> System Default
                  </Badge>
                )}
              </div>
              {selectedRole?.description && (
                <CardDescription>{selectedRole?.description}</CardDescription>
              )}
            </div>
            {selectedRole && can('role:delete') && !isOwnerRole && (
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button variant="ghost" size="36" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownContent align="end">
                  <DropdownItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteRole(selectedRole.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Role
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6">
            {selectedRole ? (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Permissions configuration
                  </h3>
                  <div className="grid gap-4">
                    {permissions?.map(({ group, permissions }) => (
                      <PermissionGroup
                        key={group}
                        icon={Layout}
                        label={group}
                        description={''}
                        permissions={permissions}
                        allowedPermissions={selectedRolePermissions}
                        onPermissionCheckedChange={
                          handlePermissionCheckedChange
                        }
                        readOnly={!canUpdateRole}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a role to view permissions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
