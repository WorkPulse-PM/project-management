import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useInvitationActions from '@/hooks/useInvitationActions';
import { apiBase } from '@/lib/api';
import { InvitationStatus, type Invitation } from '@/lib/types/invitationTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Ban, Send, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function InvitationsHistoryTab({
  openInviteModal,
}: {
  openInviteModal: VoidFunction;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { projectId } = useParams();
  const { data, isPending } = useQuery({
    queryKey: ['projects', projectId, 'invitations-history'],
    queryFn: async () => {
      const res = await apiBase.get<Invitation[]>(
        `/projects/${projectId}/invitations`
      );
      return res.data;
    },
  });

  const { revokeMutation, inviteMutation } = useInvitationActions();

  const confirmRevoke = async () => {
    if (!revokeId) return;
    await revokeMutation.mutateAsync(revokeId);
    setRevokeId(null);
    toast.success('Invitation revoked successfully');
  };

  const filtered = useMemo(() => {
    return (
      data
        ?.filter(item => {
          if (!search) return true;
          return item.email.toLowerCase().includes(search.toLowerCase());
        })
        .filter(item => {
          if (filterStatus === 'all') return true;
          return item.status === filterStatus;
        }) || []
    );
  }, [search, filterStatus, data]);

  return (
    <div className="p-4 mt-4 space-y-6 border rounded-md">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-lg font-semibold">Invitations History</h1>
          <p className="text-sm text-fg-tertiary">
            All invitations sent for this project.
          </p>
        </div>
        <Button onClick={openInviteModal}>
          <UserPlus />
          Invite
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by email..."
          className="w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isPending ? (
        <div className="flex items-center justify-center w-full h-60">
          <Spinner />
        </div>
      ) : (
        <Table className="border rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-muted-foreground"
                >
                  No invitations found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.role.name}</TableCell>
                  <TableCell className="flex flex-col gap-1 justify-center">
                    <Badge
                      size={'20'}
                      color={
                        item.status === 'ACCEPTED'
                          ? 'success'
                          : item.status === 'PENDING'
                            ? 'warning'
                            : item.status === 'EXPIRED'
                              ? 'error'
                              : 'neutral'
                      }
                    >
                      {item.status}
                    </Badge>
                    {item.status === InvitationStatus.REVOKED && (
                      <p className="text-xs text-fg-tertiary">
                        By {item.revokedByUser.name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{item.invitedByUser.name}</TableCell>
                  <TableCell>
                    {item.createdAt
                      ? formatDistanceToNow(item.createdAt, { addSuffix: true })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.expiresAt ? formatDistanceToNow(item.expiresAt) : '—'}
                  </TableCell>
                  <TableCell>
                    {item.status === 'PENDING' && (
                      <Button
                        variant={'soft'}
                        size={'28'}
                        color="error"
                        onClick={() => setRevokeId(item.id)}
                      >
                        <Ban />
                        Revoke
                      </Button>
                    )}
                    {item.status === InvitationStatus.REVOKED && (
                      <Button
                        variant={'soft'}
                        size={'28'}
                        onClick={() => {
                          inviteMutation.mutateAsync({
                            email: item.email,
                            roleId: item.roleId,
                          });
                        }}
                        loading={inviteMutation.isPending}
                        disabled={inviteMutation.isPending}
                      >
                        <Send />
                        Send another invite
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={!!revokeId}
        onOpenChange={state => {
          if (!state) setRevokeId(null);
        }}
      >
        <DialogContent closeButton="hidden">
          <DialogHeader>
            <DialogTitle>Revoke Invitation?</DialogTitle>
            <DialogDescription className="leading-5">
              Are you sure you want to revoke this invitation? This cannot be
              undone. You'll have to send a new invitation to invite this user
              again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                color="neutral"
                variant="outline"
                disabled={revokeMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="strong"
              loading={revokeMutation.isPending}
              disabled={revokeMutation.isPending}
              onClick={confirmRevoke}
            >
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
