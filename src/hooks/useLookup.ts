import { apiBase } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export type LookupData<T extends string> = {
  [key in T]: Array<{ label: string; value: string; [key: string]: any }>;
};

export const lookupKeys = [
  'projectRoles',
  'taskStatuses',
  'projectMembers',
] as const;
export type LookupKeys = (typeof lookupKeys)[number];

export default function useLookup<T extends LookupKeys>(key: T) {
  const { projectId } = useParams();
  const { data, isFetching } = useQuery({
    queryKey: ['lookup', projectId, key],
    enabled: !!key,
    staleTime: Infinity,
    queryFn: async () => {
      const response = await apiBase.get<LookupData<T>>(
        `/lookups/${projectId}?keys=${key}`
      );
      return response.data;
    },
  });
  return [data ? data[key] : [], isFetching] as const;
}
