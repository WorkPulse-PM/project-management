import AppLayout from '@/AppLayout';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import { ForgotpasswordPage } from '@/pages/forgot-password-page';
import { SigninPage } from '@/pages/signin-page.tsx';
import { SignupPage } from '@/pages/signup-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import AuthLayout from '@/layouts/AuthLayout';
import RootProvider from '@/providers/RootProvider';
import { OfflineDetector } from '@/components/OfflineDetcetor';
import { ResetpasswordPage } from '@/pages/reset-password-page';
import DashboardPage from '@/pages/dashboard-page';
import SettingsPage from './pages/settings-page';

console.log(import.meta.env.VITE_BACKEND_URL);

const router = createBrowserRouter([
  {
    Component: RootProvider,
    children: [
      {
        path: '/',
        Component: AppLayout,
        children: [
          {
            index: true,
            Component: DashboardPage,
          },
          {
            path: '/settings',
            Component: SettingsPage,
          },
        ],
      },
      {
        path: 'auth',
        Component: AuthLayout,
        children: [
          {
            path: 'signin',
            Component: SigninPage,
          },
          {
            path: 'signup',
            Component: SignupPage,
          },
          {
            path: 'forgot-password',
            Component: ForgotpasswordPage,
          },
          {
            path: 'reset-password',
            Component: ResetpasswordPage,
          },
        ],
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <OfflineDetector />
    <RouterProvider router={router} />
  </ThemeProvider>
);
