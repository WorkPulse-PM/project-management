import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AvatarGroup, { getInitials } from '@/components/ui/avatar-group';
import { IconButton } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ProjectCardProps } from '@/lib/types/projectTypes';
import { formatDate } from 'date-fns';
import { CalendarIcon, MoreVertical } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function ProjectCard(props: ProjectCardProps) {
  const { name, description, createdAt, members, image, projectKey } = props;
  const formattedCreatedAt = createdAt
    ? formatDate(createdAt, 'MMM dd, yyyy')
    : null;

  return (
    <div className="flex flex-col w-full h-full gap-3 p-4 transition-colors border rounded-md cursor-pointer bg-elevation-level1 hover:border-primary-border">
      <div className="flex items-start gap-2">
        <Avatar size="36">
          <AvatarImage src={image || undefined} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="overflow-hidden font-medium text-ellipsis text-md text-fg-primary leading-5 line-clamp-2">
            {name}
          </h3>
          <Badge size={'20'} variant={'soft'}>
            {projectKey}
          </Badge>
        </div>
        <IconButton variant={'ghost'} color={'neutral'} size={'28'}>
          <MoreVertical />
        </IconButton>
      </div>
      <p className="flex-1 text-sm text-fg-secondary line-clamp-2">
        {description}
      </p>
      <div className="flex items-center justify-between">
        {formattedCreatedAt ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-fg-tertiary">
                <CalendarIcon size={14} />
                <span className="text-xs ">{formattedCreatedAt}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent withArrow side="bottom">
              This project was created on {formattedCreatedAt}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div></div>
        )}
        {members && (
          <AvatarGroup
            avatars={members}
            size="32"
            avatarFallbackProps={{ className: 'text-xs' }}
          />
        )}
      </div>
    </div>
  );
}
