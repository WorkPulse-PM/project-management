import { Navigate, Outlet } from 'react-router-dom';
import Loading from './components/Loading';
import { authClient } from './lib/authClient';
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
} from '@/components/ui/sidebar';
import {
  Home,
  Compass,
  Utensils,
  ShoppingBag,
  Heart,
  Tag,
  HelpCircle,
  Truck,
  Users,
  Download,
  LogOut,
  HandHeart,
  ChevronRight,
} from 'lucide-react';

const AppLayout = () => {
  const { data, isPending } = authClient.useSession();

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
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Compass className="w-4 h-4" />
                  <span>Browse All</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Utensils className="w-4 h-4" />
                  <span>Restaurants</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <ShoppingBag className="w-4 h-4" />
                  <span>My Orders</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Heart className="w-4 h-4" />
                  <span>Favorites</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Tag className="w-4 h-4" />
                  <span>Promotions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HelpCircle className="w-4 h-4" />
                  <span>Help</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Truck className="w-4 h-4" />
                  <span>Track my Delivery</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {/* Invite Friends Section */}
          <SidebarGroup>
            <section className="border border-soft rounded-lg flex items-center gap-3 justify-center cursor-pointer hover:bg-fill2">
              <HandHeart size={20} className="text-fg-secondary" />
              <div>
                <SidebarGroupLabel className="text-sm font-medium">
                  Invite a friend
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <p className="text-xs text-muted-foreground px-2 py-1">
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
                <Users className="w-4 h-4" />
                <span>Business Account</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Download className="w-4 h-4" />
                <span>Download App</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="overflow-y-auto">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
