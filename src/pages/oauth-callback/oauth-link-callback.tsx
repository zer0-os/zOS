import ZeroLogo from '../../zero-logo.svg?react';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { Alert } from '@zero-tech/zui/components';
import styles from './oauth-callback.module.scss';
import { useEffect, useState, useMemo } from 'react';
import { oauth2Link } from '../../lib/oauth/oauth2Link';

export function OAuthLinkCallback() {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isCreate = urlParams.get('create') !== null;
  const requiresConfirmation = urlParams.get('requiresConfirmation') === 'true';
  const errorDescription = urlParams.get('error_description');
  const providerName = urlParams.get('providerName') || 'epic-games';

  const [showWarningModal] = useState(requiresConfirmation);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle normal success case (no warning needed)
  useEffect(() => {
    if (!requiresConfirmation && window.opener) {
      window.opener.postMessage('oauth-callback-success', window.location.origin);

      setTimeout(() => {
        window.close();
      }, 2000);
    }
  }, [requiresConfirmation]);

  // Handle retry with confirmation
  const handleConfirm = async () => {
    setIsRetrying(true);
    setError(null);
    try {
      // Retry the OAuth linking flow with confirm=true
      // Redirect the current window (whether popup or not) to Epic Games OAuth again
      // This will regenerate the linkToken and redirect to Epic Games again
      await oauth2Link(providerName, false, true);
    } catch (error: any) {
      console.error('Error retrying OAuth link:', error);
      setIsRetrying(false);
      const errorMessage = error?.message || 'Failed to retry linking. Please try again.';
      setError(errorMessage);
      // If in popup, also notify parent window
      if (window.opener) {
        window.opener.postMessage('oauth-callback-error', window.location.origin);
      }
    }
  };

  const handleCancel = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/';
    }
  };

  // Show warning content if confirmation is required
  if (showWarningModal) {
    const warningMessage =
      errorDescription ||
      'Linking this account would leave your previous account without any way to log in. If this account has no other login methods, you will lose access to it and any assets (WILD tokens, NFTs) stored on it.';

    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className={styles.container}>
          <ZeroLogo />
          <h2 className={styles.warningTitle}>⚠️ Warning: Account Access Risk</h2>
          <div className={styles.warningContent}>
            <p>{warningMessage}</p>
            <div className={styles.instructionsSection}>
              <p className={styles.instructionsTitle}>To prevent losing access to your other account:</p>
              <ol className={styles.instructionsList}>
                <li>Click "Cancel" to stop this linking process</li>
                <li>Log out of your current account</li>
                <li>Log back into the account that currently has Epic Games linked (using Epic Games login)</li>
                <li>Click your avatar in the bottom left corner → Linked Accounts or Manage Wallets</li>
                <li>Add an email or wallet login method to that account</li>
                <li>Log back into this account, then start the Epic Games linking process again</li>
              </ol>
              <p className={styles.instructionsNote}>
                Once that account has another login method, you can safely link Epic Games to this account without
                losing access.
              </p>
            </div>
            <p className={styles.confirmationNote}>
              Note: To finalize linking to this ZERO account, clicking "Confirm and Continue" will ask you to log back
              into {providerName === 'epic-games' ? 'Epic Games' : providerName} as a security measure.
            </p>
          </div>
          {error && (
            <div className={styles.errorContainer}>
              <Alert variant='error'>{error}</Alert>
            </div>
          )}
          <div className={styles.buttonContainer}>
            <Button variant={ButtonVariant.Secondary} onPress={handleCancel} disabled={isRetrying}>
              Cancel
            </Button>
            <Button variant={ButtonVariant.Primary} onPress={handleConfirm} disabled={isRetrying}>
              {isRetrying ? <Spinner /> : 'Confirm and Continue'}
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Normal success case
  return (
    <>
      <ThemeEngine theme={Themes.Dark} />
      <div className={styles.container}>
        <ZeroLogo />
        <p>Account {isCreate ? 'Created' : 'Linked'} Successfully</p>
        <p>You can now close this window</p>
      </div>
    </>
  );
}
