import { apiBase } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

type Permission = string;

export const usePermission = () => {
  const { projectId } = useParams();

  const { data: myPermissions = [], isLoading } = useQuery({
    queryKey: ['project', projectId, 'permissions'],
    queryFn: async () => {
      if (!projectId) return [];
      const { data } = await apiBase.get<Permission[]>(
        `/projects/${projectId}/my-permissions`
      );
      return data;
    },
    enabled: !!projectId,
  });

  const can = (permission: string) => {
    if (myPermissions.includes('*')) return true; // Super admin or Owner
    return myPermissions.includes(permission);
  };

  return { can, isLoading, permissions: myPermissions };
};
