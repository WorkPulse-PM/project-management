import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/authClient';
import { LayoutDashboard, LogOut, MailOpen } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import {
  NavigationItem,
  ProjectSpecificNavigation,
} from './SidebarNavigationItem';
import { ThemeToggler } from './theme-toggler';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getInitials } from './ui/avatar-group';
import { Divider } from './ui/divider';

const defaultNavigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  {
    label: 'Invitations',
    icon: MailOpen,
    path: '/invitations',
  },
];

export default function AppSidebar() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  const isInsideProject = !!projectId;

  async function handleLogout() {
    queryClient.clear();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate('/auth/signin');
        },
      },
    });
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <h1 className="text-xl font-bold">Workpulse</h1>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick links</SidebarGroupLabel>
          <SidebarGroupContent>
            {defaultNavigationItems.map(item => (
              <NavigationItem {...item} />
            ))}
            <Divider className="my-1" />
            {isInsideProject && <ProjectSpecificNavigation />}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Section */}
      <SidebarFooter>
        <SidebarMenu>
          {!isPending && session?.user && (
            <SidebarMenuItem>
              <SidebarMenuButton className="h-auto py-1" asChild>
                <Link to="/profile">
                  <Avatar size="36">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback>
                      {getInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <h4 className="font-semibold text-fg">
                      {session.user.name}
                    </h4>
                    <span className="text-xs text-fg-secondary">
                      @{session.user.username}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton>
              <ThemeToggler />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
