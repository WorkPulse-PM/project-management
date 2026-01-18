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
import { apiBase } from '@/lib/api';
import type { Permission } from '@/lib/types/permissionTypes';
import type { Role } from '@/lib/types/roleTypes';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Layout,
  MoreVertical,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PermissionGroup from './PermissionGroup';
import { type PermissionAction } from './RoleListItem';
import RolesSidebar from './RolesSidebar';

type GroupedPermissions = {
  group: string;
  permissions: Permission[];
};

export default function AccessControlPage() {
  const { projectId } = useParams();
  const { data: roles = [] } = useQuery({
    queryKey: ['project', projectId, 'roles'],
    queryFn: async () => {
      const { data } = await apiBase.get<Role[]>(`/rbac/${projectId}/roles`);
      if (!selectedRoleId) setSelectedRoleId(data[0]?.id);
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

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<
    string[]
  >([]);
  console.log(
    '🚀 ~ AccessControlPage ~ selectedRolePermissions:',
    selectedRolePermissions.length
  );

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  useEffect(() => {
    if (!selectedRole?.permissions) return;
    setSelectedRolePermissions(selectedRole.permissions.map(p => p.key));
  }, [selectedRoleId]);

  const handlePermissionCheckedChange = (key: string) => {
    const isAlreadyChecked = selectedRolePermissions.includes(key);

    let newPermissions: string[] = [];

    if (isAlreadyChecked) {
      newPermissions = selectedRolePermissions.filter(p => p !== key);
    } else {
      newPermissions = [...selectedRolePermissions, key];
    }
    setSelectedRolePermissions(newPermissions);
  };

  const handleUpdatePermission = (
    resourceId: string,
    action: PermissionAction,
    value: boolean
  ) => {
    // if (selectedRole.isSystem) return; // Prevent editing system roles for demo
    // setRoles(prev =>
    //   prev.map(role => {
    //     if (role.id === selectedRoleId) {
    //       return {
    //         ...role,
    //         permissions: role.permissions.map(p => {
    //           if (p.id === resourceId) {
    //             return {
    //               ...p,
    //               actions: { ...p.actions, [action]: value },
    //             };
    //           }
    //           return p;
    //         }),
    //       };
    //     }
    //     return role;
    //   })
    // );
  };

  const handleDeleteRole = (id: string) => {
    // setRoles(prev => prev.filter(r => r.id !== id));
    // if (selectedRoleId === id) {
    //   setSelectedRoleId(roles[0].id || '');
    // }
  };

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
                {/* {selectedRole?.isSystem && (
                  <Badge variant="soft" color="neutral" className="gap-1">
                    <Lock className="h-3 w-3" /> System Default
                  </Badge>
                )} */}
              </div>
              {selectedRole?.description && (
                <CardDescription>{selectedRole?.description}</CardDescription>
              )}
            </div>
            {selectedRole && (
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
                        description={'Lorem Ipsum'}
                        permissions={permissions}
                        allowedPermissions={selectedRolePermissions}
                        onPermissionCheckedChange={
                          handlePermissionCheckedChange
                        }
                        // actions={group.actions}
                        // onChange={(action, value) =>
                        //   handleUpdatePermission(group.id, action, value)
                        // }
                        // readOnly={selectedRole.isSystem}
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

      {/* <div className="fixed bottom-10 left-1/2 right-1/2 z-50 p-2 bg-white shadow w-fit flex gap-2 items-center border rounded-md">
        <p className="text-nowrap">You have unsaved changes.</p>
        <Button>Save</Button>
      </div> */}
    </div>
  );
}
