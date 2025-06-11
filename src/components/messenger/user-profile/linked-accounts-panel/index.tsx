import { PanelHeader } from '../../list/panel-header';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { bemClassName } from '../../../../lib/bem';

import { LinkedAccount } from './components/linked-account';
import { AvailableAccount } from './components/available-account';
import { featureFlags } from '../../../../lib/feature-flags';
import { useLinkedAccountsQuery } from './queries/useLinkedAccountsQuery';
import { Provider, ProviderLabels } from './types/providers';
import { ModalConfirmation } from '@zero-tech/zui/components';
import { useUnlinkAccountMutation } from './queries/useUnlinkAccountMutation';
import { useCallback, useEffect, useState } from 'react';
import { linkedAccountsQueryKeys } from './queries/keys';
import { useQueryClient } from '@tanstack/react-query';

import './styles.scss';

const cn = bemClassName('linked-accounts-panel');

export interface Properties {
  onBack: () => void;
}

export interface LinkedAccountType {
  provider: string;
  handle: string;
}

const AVAILABLE_ACCOUNTS = [Provider.EpicGames, Provider.Telegram];

export function LinkedAccountsPanel({ onBack }: Properties) {
  const enableOAuthLinking = featureFlags.enableOAuthLinking;
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [providerToUnlink, setProviderToUnlink] = useState<Provider | null>(null);
  const [providerUserIdToUnlink, setProviderUserIdToUnlink] = useState<string | null>(null);

  const unlinkAccountMutation = useUnlinkAccountMutation();
  const { data: linkedAccounts = [] } = useLinkedAccountsQuery();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data === 'oauth-callback-success') {
        queryClient.invalidateQueries({ queryKey: linkedAccountsQueryKeys.all });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [queryClient]);

  const handleUnlink = (provider: Provider, providerUserId: string) => {
    setProviderToUnlink(provider);
    setProviderUserIdToUnlink(providerUserId);
    setIsConfirmationOpen(true);
  };

  const confirmRemove = useCallback(() => {
    unlinkAccountMutation.mutate(
      { provider: providerToUnlink, providerUserId: providerUserIdToUnlink },
      {
        onSettled: () => {
          setIsConfirmationOpen(false);
          setProviderToUnlink(null);
          setProviderUserIdToUnlink(null);
        },
      }
    );
  }, [providerToUnlink, providerUserIdToUnlink, unlinkAccountMutation]);

  return (
    <div {...cn()}>
      <div {...cn('header-container')}>
        <PanelHeader title={'Linked Accounts'} onBack={onBack} />
      </div>

      <ScrollbarContainer variant='on-hover'>
        <div {...cn('body')}>
          {enableOAuthLinking && linkedAccounts.length > 0 && (
            <div {...cn('section')}>
              <h3 {...cn('section-title')}>Linked</h3>
              {linkedAccounts.map((account) => (
                <LinkedAccount
                  key={account.provider}
                  provider={account.provider}
                  providerUserId={account.providerUserId}
                  handle={account.handle}
                  onUnlink={handleUnlink}
                />
              ))}
            </div>
          )}

          <div {...cn('section')}>
            <h3 {...cn('section-title')}>Available to Link</h3>
            {AVAILABLE_ACCOUNTS.map((account) => {
              if (account !== Provider.Telegram && !enableOAuthLinking) return null;

              return <AvailableAccount key={account} provider={account} />;
            })}
          </div>
        </div>
      </ScrollbarContainer>
      {isConfirmationOpen && (
        <ModalConfirmation
          open
          title='Unlink Account'
          cancelLabel='Cancel'
          confirmationLabel='Unlink'
          onCancel={() => setIsConfirmationOpen(false)}
          onConfirm={() => confirmRemove()}
          inProgress={unlinkAccountMutation.isPending}
        >
          <p>Are you sure you want to unlink {ProviderLabels[providerToUnlink]}?</p>
        </ModalConfirmation>
      )}
    </div>
  );
}
