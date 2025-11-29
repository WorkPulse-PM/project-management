import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Kanban, Paperclip, Settings } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';

import type { ComponentType } from 'react';

export const NavigationItem = ({
  label,
  icon: Icon,
  path,
}: {
  label: string;
  icon: ComponentType<any>;
  path: string;
}) => {
  return (
    <NavLink to={path}>
      {({ isActive }) => (
        <SidebarMenuItem className={isActive ? 'bg-fill3' : ''}>
          <SidebarMenuButton>
            <Icon />
            <span>{label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </NavLink>
  );
};

export const ProjectSpecificNavigation = () => {
  const { projectId } = useParams();
  const items = [
    {
      label: 'Board',
      icon: Kanban,
      path: `/projects/${projectId}`,
    },
    {
      label: 'Attachments',
      icon: Paperclip,
      path: `/projects/${projectId}/attachments`,
    },
    {
      label: 'Projects Settings',
      icon: Settings,
      path: `/projects/${projectId}/settings`,
    },
  ];

  return items.map(item => <NavigationItem {...item} />);
};
