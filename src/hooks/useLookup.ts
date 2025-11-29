import { apiBase } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

export type LookupData<T extends string> = {
  [key in T]: Array<{ label: string; value: string; [key: string]: any }>;
};

export default function useLookup(key: string) {
  const { projectId } = useParams();
  const { data, isFetching } = useQuery({
    queryKey: ['lookup', projectId, key],
    enabled: !!key,
    queryFn: async () => {
      const response = await apiBase.get<LookupData<typeof key>>(
        `/lookups/${projectId}?keys=${key}`
      );
      return response.data;
    },
  });
  return [data ? data[key] : [], isFetching] as const;
}
