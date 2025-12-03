import { apiBase } from '@/lib/api';
import type { Invitation } from '@/lib/types/invitationTypes';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export function useInvitationDetails(inviteToken?: string | null) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invitation', inviteToken],
    enabled: Boolean(inviteToken),
    retry: 0,
    queryFn: async () => {
      if (!inviteToken) {
        throw new Error('Missing invitation token');
      }
      const res = await apiBase.get<Invitation>(`/invitations/${inviteToken}`);
      return res.data;
    },
  });

  const errorMessage =
    error instanceof AxiosError
      ? error.response?.data?.message ||
        'We could not verify this invitation. Please request a new link.'
      : error instanceof Error
        ? error.message
        : undefined;

  return {
    invitation: data,
    isInvitationLoading: isLoading,
    isInvitationError: isError,
    invitationErrorMessage: errorMessage,
  };
}

export type UseInvitationDetailsReturn = ReturnType<
  typeof useInvitationDetails
>;
