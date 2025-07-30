import React, { useState } from 'react';

import { bemClassName } from '../../../../lib/bem';

import { PanelHeader } from '../../list/panel-header';
import { Image, Modal } from '@zero-tech/zui/components';
import { Button, Variant as ButtonVariant, Color as ButtonColor } from '@zero-tech/zui/components/Button';
import {
  IconCurrencyEthereum,
  IconLink1,
  IconDownload2,
  IconLock1,
  IconLogOut3,
  IconPlus,
  IconSettings2,
  IconUser1,
  IconWallet3,
  IconTag1,
} from '@zero-tech/zui/icons';
import { InviteDialogContainer } from '../../../invite-dialog/container';
import { RewardsItem } from './rewards-item';
import { ZeroProBadge } from '../../../zero-pro-badge';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { useMatrixImage } from '../../../../lib/hooks/useMatrixImage';

import './styles.scss';

const cn = bemClassName('overview-panel');

export interface Properties {
  name: string;
  image: string;
  subHandle?: string;
  isZeroProSubscriber?: boolean;

  onBack: () => void;
  onOpenLogoutDialog: () => void;
  onOpenBackupDialog: () => void;
  onOpenEditProfile: () => void;
  onOpenRewards: () => void;
  onOpenSettings: () => void;
  onOpenDownloads: () => void;
  onManageAccounts: () => void;
  onOpenLinkedAccounts: () => void;
  onOpenZeroPro: () => void;
}

export const OverviewPanel: React.FC<Properties> = (props) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { data: imageUrl } = useMatrixImage(props.image);

  const navigateBack = () => {
    props.onBack();
  };

  const openInviteDialog = () => {
    setIsInviteDialogOpen(true);
  };

  const closeInviteDialog = () => {
    setIsInviteDialogOpen(false);
  };

  const renderInviteDialog = (): JSX.Element => {
    return (
      <Modal open={isInviteDialogOpen} onOpenChange={closeInviteDialog}>
        <InviteDialogContainer onClose={closeInviteDialog} />
      </Modal>
    );
  };

  const openLogoutDialog = () => {
    props.onOpenLogoutDialog();
  };

  const openBackupDialog = () => {
    props.onOpenBackupDialog();
  };

  const openEditProfile = () => {
    props.onOpenEditProfile();
  };

  const openRewards = () => {
    props.onOpenRewards();
  };

  const openSettings = () => {
    props.onOpenSettings();
  };

  const openDownloads = () => {
    props.onOpenDownloads();
  };

  const onManageAccounts = () => {
    props.onManageAccounts();
  };

  const openLinkedAccounts = () => {
    props.onOpenLinkedAccounts();
  };

  const openZeroPro = () => {
    props.onOpenZeroPro();
  };

  const renderDetails = () => {
    return (
      <div {...cn('details')}>
        <div {...cn('image-conatiner')}>
          {imageUrl ? (
            <Image {...cn('image')} src={imageUrl} alt='Custom Profile Image' />
          ) : (
            <div {...cn('image-placeholder')}>
              <IconCurrencyEthereum size={50} />
            </div>
          )}
        </div>

        <div {...cn('name-container')}>
          <div {...cn('name-container-inner')}>
            <div {...cn('name')}>{props.name}</div>
            {props.isZeroProSubscriber && <ZeroProBadge size={18} />}
          </div>
          {props.subHandle && <div {...cn('sub-handle')}>{props.subHandle}</div>}
        </div>
      </div>
    );
  };

  const renderActions = () => {
    return (
      <div {...cn('action-button-container')}>
        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={openZeroPro}
          startEnhancer={<IconTag1 size={20} />}
        >
          {props.isZeroProSubscriber ? 'Manage ZERO Pro' : 'Join ZERO Pro'}
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={openInviteDialog}
          startEnhancer={<IconPlus size={20} isFilled />}
        >
          Invite Friends
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={openEditProfile}
          startEnhancer={<IconUser1 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Edit Profile
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={onManageAccounts}
          startEnhancer={<IconWallet3 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Manage Wallets
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={openLinkedAccounts}
          startEnhancer={<IconLink1 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Linked Accounts
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={openBackupDialog}
          startEnhancer={<IconLock1 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Account Backup
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={openSettings}
          startEnhancer={<IconSettings2 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Settings
        </Button>

        <Button
          {...cn('action-button')}
          variant={ButtonVariant.Secondary}
          onPress={openDownloads}
          startEnhancer={<IconDownload2 size={20} />}
          color={ButtonColor.Greyscale}
        >
          Download
        </Button>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div {...cn('footer')}>
        <Button
          {...cn('footer-button')}
          variant={ButtonVariant.Secondary}
          color={ButtonColor.Greyscale}
          onPress={openLogoutDialog}
          startEnhancer={<IconLogOut3 size={20} />}
        >
          Log Out
        </Button>
      </div>
    );
  };

  const renderRewards = () => {
    return (
      <div {...cn('rewards')} onClick={openRewards}>
        <RewardsItem />
      </div>
    );
  };

  return (
    <div {...cn()}>
      <div {...cn('header-container')}>
        <PanelHeader title={'Profile'} onBack={navigateBack} />
      </div>

      <ScrollbarContainer variant='on-hover'>
        <div {...cn('panel-content-wrapper')}>
          <div {...cn('body')}>
            <div {...cn('section')}>
              {renderDetails()}
              {renderRewards()}
            </div>

            {renderActions()}
          </div>

          {renderFooter()}
        </div>
      </ScrollbarContainer>

      {renderInviteDialog()}
    </div>
  );
};
