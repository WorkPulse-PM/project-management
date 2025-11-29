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
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { ThemeToggler } from './theme-toggler';
import { Divider } from './ui/divider';
import {
  NavigationItem,
  ProjectSpecificNavigation,
} from './SidebarNavigationItem';

const defaultNavigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
];

export default function AppSidebar() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
