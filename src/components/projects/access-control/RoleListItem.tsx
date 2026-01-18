import { Badge } from '@/components/ui/badge';
import type { Role } from '@/lib/types/roleTypes';
import { cn } from '@/lib/utils';
import { Shield, Users } from 'lucide-react';
import React from 'react';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  actions: Record<PermissionAction, boolean>;
}

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
        isActive ? 'border-primary bg-primary/5' : 'bg-card'
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
        {/* {role.isSystem && (
          <Badge variant="soft" color="neutral" className="text-[10px] h-5">
            System
          </Badge>
        )} */}
      </div>
      {role.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {role.description}
        </p>
      )}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        <span>{role.usersCount} users</span>
      </div>
    </div>
  );
};

export default RoleListItem;
