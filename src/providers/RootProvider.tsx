import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

export default function RootProvider() {
  return (
    <>
      <Outlet />
      <Toaster richColors />
    </>
  );
}
