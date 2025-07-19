import { PanelHeader } from '../../list/panel-header';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { bemClassName } from '../../../../lib/bem';
import { LinkedAccount } from './components/linked-account';
import { AvailableAccount } from './components/available-account';
import { useLinkedAccountsQuery } from './queries/useLinkedAccountsQuery';
import { Provider, ProviderLabels } from './types/providers';
import { Alert, Button, IconButton, Modal, ModalConfirmation } from '@zero-tech/zui/components';
import { Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { useUnlinkAccountMutation } from './queries/useUnlinkAccountMutation';
import { useCallback, useEffect, useState } from 'react';
import { linkedAccountsQueryKeys } from './queries/keys';
import { useQueryClient } from '@tanstack/react-query';
import { AVAILABLE_ACCOUNTS } from './constants';
import { currentUserSelector } from '../../../../store/authentication/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { CitizenListItem } from '../../../citizen-list-item';
import { IconPlus, IconXClose } from '@zero-tech/zui/icons';
import { CreateEmailAccountContainer } from '../../../../authentication/create-email-account/container';
import { isAddEmailAccountModalOpenSelector } from '../../../../store/account-management/selectors';
import { openAddEmailAccountModal, closeAddEmailAccountModal } from '../../../../store/account-management';
import './styles.scss';

const cn = bemClassName('linked-accounts-panel');

export interface Properties {
  onBack: () => void;
}

export function LinkedAccountsPanel({ onBack }: Properties) {
  const dispatch = useDispatch();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [providerToUnlink, setProviderToUnlink] = useState<Provider | null>(null);
  const [providerUserIdToUnlink, setProviderUserIdToUnlink] = useState<string | null>(null);

  const isAddEmailModalOpen = useSelector(isAddEmailAccountModalOpenSelector);
  const currentUser = useSelector(currentUserSelector);
  const canAddEmail = !currentUser?.profileSummary.primaryEmail;

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

  const openEmailModal = (open: boolean) => {
    if (open) {
      dispatch(openAddEmailAccountModal());
    } else {
      dispatch(closeAddEmailAccountModal());
    }
  };

  return (
    <div {...cn()}>
      <div {...cn('header-container')}>
        <PanelHeader title={'Linked Accounts'} onBack={onBack} />
      </div>

      <ScrollbarContainer variant='on-hover'>
        <div {...cn('body')}>
          <div {...cn('section')}>
            <h3 {...cn('section-title')}>Email</h3>

            <div>
              {currentUser?.profileSummary.primaryEmail ? (
                <CitizenListItem
                  user={{
                    ...currentUser,
                    matrixId: currentUser.matrixId ?? '',
                    userId: currentUser.id,
                    firstName: currentUser.profileSummary.primaryEmail,
                    lastName: '',
                    profileImage: '',
                    lastSeenAt: '',
                    primaryZID: '',
                  }}
                  tag={''}
                />
              ) : (
                <div {...cn('alert-small')}>
                  <Alert variant='info'>
                    <div {...cn('alert-info-text')}>No email account found</div>
                  </Alert>
                </div>
              )}

              {canAddEmail && (
                <div>
                  <Button
                    variant={ButtonVariant.Secondary}
                    onPress={() => openEmailModal(true)}
                    startEnhancer={<IconPlus size={20} isFilled />}
                  >
                    Add email
                  </Button>
                </div>
              )}
            </div>
          </div>

          {linkedAccounts.length > 0 && (
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
            {AVAILABLE_ACCOUNTS.map((account) => (
              <AvailableAccount key={account} provider={account} />
            ))}
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

      {isAddEmailModalOpen && (
        <Modal
          open={isAddEmailModalOpen}
          onOpenChange={(isOpen) => {
            isOpen ? openEmailModal(true) : openEmailModal(false);
          }}
          {...cn('add-email-modal')}
        >
          <div {...cn('add-email-body')}>
            <div {...cn('add-email-title-bar')}>
              <h3 {...cn('add-email-title')}>Add Email</h3>
              <IconButton
                {...cn('add-email-close')}
                size='large'
                Icon={IconXClose}
                onClick={() => openEmailModal(false)}
              />
            </div>

            <CreateEmailAccountContainer addAccount />
          </div>
        </Modal>
      )}
    </div>
  );
}
