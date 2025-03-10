import { ErrorComponent } from './error-component';

export const ErrorPage = () => {
  const handleRetry = () => {
    window.location.href = '/';
  };

  const error = 'There was an error loading ZERO, please try again.';

  return <ErrorComponent onRetry={handleRetry} error={error} />;
};
