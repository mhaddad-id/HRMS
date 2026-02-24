export function LoginMessages({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (error === 'auth') {
    return (
      <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3 text-center">
        Authentication failed. Please try again or sign in with your link.
      </div>
    );
  }
  if (message === 'confirm_email') {
    return (
      <div className="rounded-md bg-primary/10 text-primary text-sm p-3 text-center">
        Check your email to confirm your account, then sign in.
      </div>
    );
  }
  return null;
}
