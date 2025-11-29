import {
  Link,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import Loading from './components/Loading';
import { authClient } from './lib/authClient';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Sidebar,
  SidebarHeader,
  SidebarProvider,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Settings,
  Download,
  LogOut,
  HandHeart,
  ChevronRight,
  ListCollapse,
} from 'lucide-react';

import { ThemeToggler } from './components/theme-toggler';
import { useQueryClient } from '@tanstack/react-query';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

const AppLayout = () => {
  const queryClient = useQueryClient();
  const { data, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Generate breadcrumb items from current path
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);

    // Always show breadcrumbs
    // If on root, show "Dashboard"
    if (pathnames.length === 0) {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {pathnames.map((segment, index) => {
            const path = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;

            // Capitalize first letter of segment for display
            const label = segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
              <div key={path} className="flex items-center gap-2">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={path}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  if (isPending) return <Loading overlay />;
  if (!data) return <Navigate to={'/auth/signin'} replace />;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <h1 className="text-xl font-bold">Workpulse</h1>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup className="flex-1">
            <SidebarMenu>
              {navigationItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className={isActive ? 'bg-fill3' : ''}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {/* Invite Friends Section */}
          <SidebarGroup>
            <section className="flex items-center justify-center gap-3 border rounded-lg cursor-pointer border-soft hover:bg-fill2">
              <HandHeart size={20} className="text-fg-secondary" />
              <div>
                <SidebarGroupLabel className="text-sm font-medium">
                  Invite a friend
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <p className="px-2 py-1 text-xs text-muted-foreground">
                    Get 15% off on your order
                  </p>
                </SidebarGroupContent>
              </div>
              <ChevronRight size={20} className="text-fg-secondary" />
            </section>
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
              <SidebarMenuButton>
                <Download className="w-4 h-4" />
                <span>Download App</span>
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

      <SidebarInset className="overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center gap-2 p-4 border-b">
          <SidebarTrigger>
            <ListCollapse size={20} />
          </SidebarTrigger>
          {getBreadcrumbs()}
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
