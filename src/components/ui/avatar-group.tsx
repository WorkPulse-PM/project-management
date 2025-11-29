import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  type AvatarFallbackProps,
  type AvatarProps,
} from '@/components/ui/avatar';
import type { ProjectMember } from '@/lib/types/projectTypes';
import { cn } from '@/lib/utils';

// Utility function to get the initials of a name
export function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? '';
  }
  return (
    (parts[0][0]?.toUpperCase() ?? '') +
    (parts[parts.length - 1][0]?.toUpperCase() ?? '')
  );
}

type AvatarGroupProps = AvatarProps & {
  size?: string;
  avatarFallbackProps?: AvatarFallbackProps;
  avatars: ProjectMember[];
  avatarsCount?: number;
};

export default function AvatarGroup({
  avatars,
  size = '32',
  avatarsCount = 3,
  avatarFallbackProps = {},
  ...rest
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, avatarsCount);
  const hiddenAvatarsCount = avatars.length - visibleAvatars.length;
  return (
    <div className="flex -space-x-2.5">
      {visibleAvatars.map(person => (
        <Avatar
          size={size}
          {...rest}
          className={cn('border-bg border-4 hover:z-10', rest.className)}
          key={person.name || person.image}
        >
          <AvatarImage src={person.image} />
          <AvatarFallback {...avatarFallbackProps}>
            {getInitials(person.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {hiddenAvatarsCount > 0 && (
        <Avatar size={size} className="border-4 border-bg hover:z-10">
          <AvatarFallback
            {...avatarFallbackProps}
            className={cn(
              'text-sm font-semibold',
              avatarFallbackProps.className
            )}
          >
            +{hiddenAvatarsCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
