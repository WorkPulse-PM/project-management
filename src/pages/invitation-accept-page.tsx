import { InvitationBanner } from '@/components/auth/InvitationBanner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/authClient';
import { apiBase } from '@/lib/api';
import { useInvitationDetails } from '@/hooks/useInvitationDetails';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function InvitationAcceptPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const inviteToken = searchParams.get('inviteToken');

  const {
    invitation,
    isInvitationError,
    isInvitationLoading,
    invitationErrorMessage,
  } = useInvitationDetails(inviteToken);

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [isAccepting, setIsAccepting] = useState(false);

  const isLoading = isInvitationLoading || isSessionLoading;
  const inviteEmail = invitation?.email;
  const loggedInEmail = session?.user?.email || null;
  const emailsMismatch =
    !!loggedInEmail && !!inviteEmail && loggedInEmail !== inviteEmail;

  useEffect(() => {
    if (!inviteToken) {
      navigate('/auth/signin', { replace: true });
    }
  }, [inviteToken, navigate]);

  useEffect(() => {
    // If user is NOT logged in but the invite is valid and there is no mismatch,
    // guide them straight into the correct auth flow.
    if (
      !isLoading &&
      !loggedInEmail &&
      invitation &&
      inviteToken &&
      !emailsMismatch
    ) {
      const target = invitation.requiresRegistration
        ? `/auth/signup?inviteToken=${inviteToken}`
        : `/auth/signin?inviteToken=${inviteToken}`;

      navigate(target, { replace: true });
    }
  }, [
    loggedInEmail,
    emailsMismatch,
    invitation,
    inviteToken,
    isLoading,
    navigate,
  ]);

  const handleContinueAsCurrentUser = () => {
    navigate('/', { replace: true });
  };

  const handleAcceptAsLoggedInUser = async () => {
    if (!inviteToken || !invitation) return;
    try {
      setIsAccepting(true);
      await apiBase.get(`/invitations/${inviteToken}/accept`);
      toast.success(
        'Invitation accepted! You now have access to this project.'
      );
      navigate('/', { replace: true });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'We could not accept this invitation. Please try again.';
      toast.error(message);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSwitchAccount = async () => {
    if (!inviteToken) return;

    queryClient.clear();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate(`/invitations/accept?inviteToken=${inviteToken}`, {
            replace: true,
          });
        },
      },
    });
  };

  const showMismatchCard = emailsMismatch && !!invitation;
  const showLoggedInAcceptCard =
    !isLoading &&
    !!invitation &&
    !!inviteToken &&
    !!loggedInEmail &&
    !emailsMismatch;

  const showContentCard =
    !isInvitationLoading && (!!invitation || isInvitationError || !inviteToken);

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-bg px-5 py-10">
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-6 rounded-2xl border border-soft bg-elevated p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-accent text-primary">
              <Sparkles className="size-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-fg">
                Accept your project invitation
              </h1>
              {inviteEmail && (
                <p className="text-xs text-fg-secondary">
                  This invite was sent to{' '}
                  <span className="font-medium">{inviteEmail}</span>
                </p>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Spinner />
              <p className="text-sm text-fg-secondary text-center">
                We&apos;re checking your invitation and account status. Just a
                moment.
              </p>
            </div>
          )}

          {showContentCard && inviteToken && (
            <InvitationBanner
              show={true}
              mode={invitation?.requiresRegistration ? 'signup' : 'signin'}
              invitation={invitation}
              isLoading={isInvitationLoading}
              isError={isInvitationError}
              errorMessage={invitationErrorMessage}
            />
          )}

          {!inviteToken && !isLoading && (
            <div className="flex flex-col gap-3 rounded-lg border border-soft bg-fill2 p-4 text-sm">
              <p className="font-medium text-fg">
                This invitation link is missing a token.
              </p>
              <p className="text-fg-secondary">
                Try opening the full link from your email again, or ask the
                sender to resend your invite.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  color="primary"
                  onClick={() => navigate('/auth/signin')}
                >
                  Go to sign in
                </Button>
              </div>
            </div>
          )}

          {showMismatchCard && (
            <div className="flex flex-col gap-3 rounded-lg border border-soft bg-fill2 p-4 text-sm">
              <p className="font-medium text-fg">
                You&apos;re signed in as a different user.
              </p>
              <p className="text-fg-secondary">
                You&apos;re currently signed in as{' '}
                <span className="font-medium">{loggedInEmail}</span>, but this
                invitation was sent to{' '}
                <span className="font-medium">{inviteEmail}</span>. To accept
                this invitation, switch to the invited account.
              </p>
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  color="neutral"
                  className="order-2 sm:order-1"
                  onClick={handleContinueAsCurrentUser}
                >
                  Continue as current user
                </Button>
                <Button
                  color="primary"
                  className="inline-flex items-center gap-2 order-1 sm:order-2"
                  onClick={handleSwitchAccount}
                >
                  <LogOut className="size-4" />
                  Sign out and continue invite
                </Button>
              </div>
            </div>
          )}

          {showLoggedInAcceptCard && (
            <div className="flex flex-col gap-3 rounded-lg border border-soft bg-fill2 p-4 text-sm">
              <p className="font-medium text-fg">
                You&apos;re all set to join this project.
              </p>
              <p className="text-fg-secondary">
                You&apos;re signed in as{' '}
                <span className="font-medium">{loggedInEmail}</span>, which
                matches the email this invitation was sent to. When you&apos;re
                ready, accept the invite below to get access.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 justify-end">
                <Button
                  color="primary"
                  className="inline-flex items-center gap-2"
                  onClick={handleAcceptAsLoggedInUser}
                  disabled={isAccepting}
                >
                  {isAccepting ? (
                    <>
                      <Spinner size={18} variant="simple" />
                      Accepting...
                    </>
                  ) : (
                    'Accept invitation and continue'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvitationAcceptPage;
