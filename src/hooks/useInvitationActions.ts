import { apiBase } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function useInvitationActions() {
  const queryClient = useQueryClient();
  const { projectId } = useParams();

  const inviteMutation = useMutation({
    mutationFn: (body: { email: string; roleId: string }) =>
      apiBase.post(`/projects/${projectId}/invite`, body),
    async onSuccess({ data }) {
      toast.success(data?.message || 'Invitation sent successfully');
      await queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'invitations-history'],
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) =>
      apiBase.patch(`/invitations/${invitationId}/revoke`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'invitations-history'],
      });
    },
  });

  return {
    inviteMutation,
    revokeMutation,
  };
}
