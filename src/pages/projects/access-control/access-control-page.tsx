import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Search,
  Trash2,
  Check,
  MoreVertical,
  Users,
  Layout,
  Settings,
  FileText,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { Divider } from '@/components/ui/divider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// --- Types ---

type PermissionAction = 'create' | 'read' | 'update' | 'delete';

interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  actions: Record<PermissionAction, boolean>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  isSystem?: boolean;
  permissions: PermissionGroup[];
}

// --- Mock Data ---

const MOCK_RESOURCES = [
  {
    id: 'projects',
    name: 'Projects',
    icon: Layout,
    description: 'Manage project access',
  },
  {
    id: 'tasks',
    name: 'Tasks',
    icon: FileText,
    description: 'Manage task creation and updates',
  },
  {
    id: 'members',
    name: 'Team Members',
    icon: Users,
    description: 'Invite and manage team members',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'System wide settings configuration',
  },
];

const INITIAL_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all resources and settings.',
    usersCount: 3,
    isSystem: true,
    permissions: MOCK_RESOURCES.map(r => ({
      ...r,
      actions: { create: true, read: true, update: true, delete: true },
    })),
  },
  {
    id: 'manager',
    name: 'Project Manager',
    description: 'Can manage projects and team members, but not billing.',
    usersCount: 8,
    permissions: MOCK_RESOURCES.map(r => ({
      ...r,
      actions: {
        create: r.id !== 'settings',
        read: true,
        update: r.id !== 'settings',
        delete: r.id === 'tasks',
      },
    })),
  },
  {
    id: 'member',
    name: 'Team Member',
    description: 'Can view projects and update assigned tasks.',
    usersCount: 24,
    permissions: MOCK_RESOURCES.map(r => ({
      ...r,
      actions: {
        create: false,
        read: true,
        update: r.id === 'tasks',
        delete: false,
      },
    })),
  },
];

// --- Sub-components ---

const RoleListItem = ({
  role,
  isActive,
  onClick,
}: {
  role: Role;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-all hover:bg-muted/50',
        isActive ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Shield
            className={cn(
              'h-4 w-4',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <h3 className="font-medium leading-none">{role.name}</h3>
        </div>
        {role.isSystem && (
          <Badge variant="soft" color="neutral" className="text-[10px] h-5">
            System
          </Badge>
        )}
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">
        {role.description}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>{role.usersCount} users</span>
      </div>
    </div>
  );
};

const PermissionRow = ({
  icon: Icon,
  label,
  description,
  actions,
  onChange,
  readOnly,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  actions: Record<PermissionAction, boolean>;
  onChange: (action: PermissionAction, value: boolean) => void;
  readOnly?: boolean;
}) => {
  const actionLabels: Record<PermissionAction, string> = {
    read: 'View',
    create: 'Create',
    update: 'Edit',
    delete: 'Delete',
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-medium">{label}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {(Object.keys(actions) as PermissionAction[]).map(action => (
          <div
            key={action}
            className="flex flex-col items-center gap-1.5 rounded-md border bg-muted/30 p-2 px-3 transition-colors hover:bg-muted/50"
          >
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              {actionLabels[action]}
            </span>
            <SwitchWrapper>
              <Switch
                checked={actions[action]}
                onCheckedChange={checked =>
                  !readOnly && onChange(action, checked)
                }
                disabled={readOnly}
                size="20"
              />
            </SwitchWrapper>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function AccessControlPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    INITIAL_ROLES[0].id
  );
  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];
  const [searchQuery, setSearchQuery] = useState('');

  // Create Role State
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const handleUpdatePermission = (
    resourceId: string,
    action: PermissionAction,
    value: boolean
  ) => {
    if (selectedRole.isSystem) return; // Prevent editing system roles for demo

    setRoles(prev =>
      prev.map(role => {
        if (role.id === selectedRoleId) {
          return {
            ...role,
            permissions: role.permissions.map(p => {
              if (p.id === resourceId) {
                return {
                  ...p,
                  actions: { ...p.actions, [action]: value },
                };
              }
              return p;
            }),
          };
        }
        return role;
      })
    );
  };

  const handleDeleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
    if (selectedRoleId === id) {
      setSelectedRoleId(roles[0].id || '');
    }
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;

    const newRole: Role = {
      id: newRoleName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: newRoleName,
      description: newRoleDescription || 'No description provided.',
      usersCount: 0,
      permissions: MOCK_RESOURCES.map(r => ({
        ...r,
        actions: { create: false, read: true, update: false, delete: false },
      })),
    };

    setRoles([...roles, newRole]);
    setSelectedRoleId(newRole.id);
    setIsCreateRoleOpen(false);
    setNewRoleName('');
    setNewRoleDescription('');
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
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
              variant="strong"
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
                onClick={() => setSelectedRoleId(role.id)}
              />
            ))}
            {filteredRoles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No roles found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content: Permissions */}
        <Card className="col-span-1 h-full flex flex-col lg:col-span-8 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{selectedRole?.name}</CardTitle>
                {selectedRole?.isSystem && (
                  <Badge variant="soft" color="neutral" className="gap-1">
                    <Lock className="h-3 w-3" /> System Default
                  </Badge>
                )}
              </div>
              <CardDescription>{selectedRole?.description}</CardDescription>
            </div>
            {selectedRole && !selectedRole.isSystem && (
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
                    {selectedRole.permissions.map(group => (
                      <PermissionRow
                        key={group.id}
                        icon={group.icon}
                        label={group.name}
                        description={group.description}
                        actions={group.actions}
                        onChange={(action, value) =>
                          handleUpdatePermission(group.id, action, value)
                        }
                        readOnly={selectedRole.isSystem}
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
    </div>
  );
}
