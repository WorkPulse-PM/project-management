import { AuthLoading } from '@/helpers/AuthLoading';
import { authClient } from '@/lib/authClient';
import { Navigate, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  const { data, isPending } = authClient.useSession();

  if (isPending) return <AuthLoading />;
  if (data)
    return (
      <Navigate
        to={{
          pathname: '/',
          search: location.search,
        }}
        replace
      />
    );

  return <Outlet />;
}
