import AccessControlPage from '@/components/projects/access-control/AccessControl';
import { usePermission } from '@/hooks/use-permission';

const SettingsPage = () => {
  const { can, isLoading } = usePermission();

  if (isLoading) return <div>Loading permissions...</div>;

  if (!can('project:roles:manage')) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/10 text-destructive rounded-lg border border-destructive/20 m-4">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <AccessControlPage />;
};

export default SettingsPage;
