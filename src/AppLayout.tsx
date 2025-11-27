import { Navigate, Outlet } from 'react-router-dom';
import Loading from './components/Loading';
import { authClient } from './lib/authClient';

const AppLayout = () => {
  const { data, isPending } = authClient.useSession();

  if (isPending) return <Loading overlay />;
  if (!data) return <Navigate to={'/auth/signin'} />;
  return (
    <div className="w-screen flex">
      <aside className="w-63.75 h-screen border border-l-0 border-t-0 border-b-0">
        Sidebar
      </aside>
      <div className="grow overflow-y-auto">
        <p>Pages Content</p>
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
