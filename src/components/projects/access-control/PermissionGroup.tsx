import { Switch, SwitchWrapper } from '@/components/ui/switch';
import type { PermissionAction } from './RoleListItem';
import type { Permission } from '@/lib/types/permissionTypes';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const PermissionGroup = ({
  icon: Icon,
  label,
  description,
  permissions,
  allowedPermissions,
  onPermissionCheckedChange,
  // actions,
  // onChange,
  // readOnly,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  permissions: Permission[];
  allowedPermissions: string[];
  onPermissionCheckedChange: (key: string) => void;
  // actions: Record<PermissionAction, boolean>;
  // onChange: (action: PermissionAction, value: boolean) => void;
  // readOnly?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-2 items-center ">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium">{label}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {permissions.map(permission => (
          <div
            key={permission.id}
            className="flex justify-between items-center  gap-1.5 rounded-md border bg-muted/30 p-2 px-3 transition-colors hover:bg-muted/50"
          >
            <span className="text-xs text-muted-foreground">
              {permission.label}
            </span>
            <SwitchWrapper>
              <Switch
                checked={allowedPermissions.includes(permission.key)}
                onCheckedChange={() =>
                  onPermissionCheckedChange(permission.key)
                }
                // disabled={readOnly}
                size="20"
              />
            </SwitchWrapper>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionGroup;
