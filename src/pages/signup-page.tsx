import Logo from '@/components/Logo';
import { SignupForm } from '@/components/SignupForm';
import { Button } from '@/components/ui/button';
import { InvitationBanner } from '@/components/auth/InvitationBanner';
import { useInvitationDetails } from '@/hooks/useInvitationDetails';
import { useSignup } from '@/hooks/useSignup';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');

  const {
    invitation,
    isInvitationError,
    isInvitationLoading,
    invitationErrorMessage,
  } = useInvitationDetails(inviteToken);

  const {
    form,
    isLoading,
    showPassword,
    togglePasswordVisibility,
    IconComponent,
    isUsernameAvailable,
    inputRef,
    onSubmit,
  } = useSignup();

  const invitationEmail = invitation?.email;
  const hasInviteToken = Boolean(inviteToken);
  useEffect(() => {
    if (invitationEmail) {
      form.setValue('email', invitationEmail);
    }
  }, [form, invitationEmail]);

  useEffect(() => {
    if (invitation && invitation.requiresRegistration === false) {
      navigate(
        `/auth/signin?email=${encodeURIComponent(invitation.email)}&inviteToken=${inviteToken}`,
        { replace: true }
      );
    }
  }, [invitation]);

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-bg px-5 py-10">
      <div className="w-100 max-w-xl flex bg-bg">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <Logo />

            <div className="flex gap-2 flex-col">
              <h1 className="heading-5">Sign Up</h1>
              <p className="text-fg-secondary text-sm">
                Already have an account?{' '}
                <Button asChild variant="link" color="primary">
                  <Link to="/auth/signin">Sign in</Link>
                </Button>
              </p>
            </div>

            <InvitationBanner
              show={hasInviteToken}
              mode="signup"
              invitation={invitation}
              isLoading={isInvitationLoading}
              isError={isInvitationError}
              errorMessage={invitationErrorMessage}
            />
          </div>

          <SignupForm
            email={invitationEmail}
            form={form}
            isLoading={isLoading}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            IconComponent={IconComponent}
            isUsernameAvailable={isUsernameAvailable}
            inputRef={inputRef}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
