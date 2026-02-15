import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { DashboardLoading } from '@/helpers/DashboardLoading';
import { apiBase } from '@/lib/api';
import { authClient } from '@/lib/authClient';
import { useQuery } from '@tanstack/react-query';
import { ListCollapse } from 'lucide-react';
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from 'react-router-dom';
import AppSidebar from './components/AppSidebar';
import { NotificationBell } from './components/NotificationBell';
import SocketProvider from './providers/SocketProvider';

const AppLayout = () => {
  const { data, isPending } = authClient.useSession();
  const location = useLocation();

  // Extract projectId from URL for breadcrumbs
  const pathnames = location.pathname.split('/').filter(x => x);
  const { projectId } = useParams();

  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await apiBase.get<{ name: string }>(`/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  // Generate breadcrumb items from current path
  const getBreadcrumbs = () => {
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

            let label = segment.charAt(0).toUpperCase() + segment.slice(1);

            // Replace ID with project title
            if (projectId && segment === projectId && project?.name) {
              label = project.name;
            }

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

  if (isPending) return <DashboardLoading />;
  if (!data)
    return (
      <Navigate
        to={{ pathname: '/auth/signin', search: location.search }}
        replace
      />
    );

  return (
    <SocketProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-y-auto">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-2 p-4 border-b bg-elevation-level1">
            <div className="flex items-center gap-2">
              <SidebarTrigger>
                <ListCollapse size={20} />
              </SidebarTrigger>
              {getBreadcrumbs()}
            </div>
            <NotificationBell />
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SocketProvider>
  );
};

export default AppLayout;
