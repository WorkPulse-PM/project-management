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
import { authClient } from '@/lib/authClient';
import { ListCollapse } from 'lucide-react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './components/AppSidebar';

const AppLayout = () => {
  const { data, isPending } = authClient.useSession();
  const location = useLocation();

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

  if (isPending) return <DashboardLoading />;
  if (!data)
    return (
      <Navigate
        to={{ pathname: '/auth/signin', search: location.search }}
        replace
      />
    );

  return (
    <SidebarProvider>
      <AppSidebar />
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
