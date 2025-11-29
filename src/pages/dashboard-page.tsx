import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AvatarGroup from '@/components/ui/avatar-group';
import { Button, IconButton } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CalendarIcon, MoreVertical, PlusIcon } from 'lucide-react';

export const people = [
  {
    name: 'Noah Brooks',
    image: 'https://avatar.iran.liara.run/public/18',
  },
  {
    name: 'Liam Reed',
    image: 'https://avatar.iran.liara.run/public/32',
  },
  {
    name: 'Ethan Cole',
    image: 'https://avatar.iran.liara.run/public/25',
  },
];

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-fg-primary">Projects</h2>
          <p>Manage and track your projects</p>
        </div>
        <Button>
          <PlusIcon />
          Create Project
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col max-w-xs gap-3 p-4 transition-colors border rounded-md cursor-pointer hover:border-primary-border">
          <div className="flex items-center gap-2">
            <Avatar size="36">
              <AvatarFallback>UE</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1">
              <h3 className="font-medium text-md text-fg-primary">
                Project - Uber Eats
              </h3>
            </div>
            <IconButton variant={'ghost'} color={'neutral'} size={'28'}>
              <MoreVertical />
            </IconButton>
          </div>
          <p className="text-sm text-fg-secondary">
            Mobile App development for the food delivery service - Uber Eats.
          </p>
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-fg-tertiary">
                  <CalendarIcon size={14} />
                  <span className="text-xs ">Dec 2, 2024</span>
                </div>
              </TooltipTrigger>
              <TooltipContent withArrow side="bottom">
                This project was created on Dec 2, 2024
              </TooltipContent>
            </Tooltip>
            <AvatarGroup
              avatars={people}
              size="32"
              avatarFallbackProps={{ className: 'text-xs' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
