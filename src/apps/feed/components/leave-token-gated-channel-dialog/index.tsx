import * as React from 'react';
import { useLeaveTokenGatedChannel } from '../../hooks/useLeaveTokenGatedChannel';

import styles from './styles.module.scss';

import { Color, Modal, Variant } from '../../../../components/modal';

export interface Properties {
  zid: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveTokenGatedChannelDialog: React.FC<Properties> = ({ zid, isOpen, onClose }) => {
  const leaveTokenGatedChannel = useLeaveTokenGatedChannel();

  const handleLeave = async () => {
    try {
      await leaveTokenGatedChannel.mutateAsync(zid);
      onClose(); // Close dialog on success
    } catch (error) {
      // Error is handled by the mutation, no need to catch here
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title='Leave Channel?'
      primaryText='Leave Channel'
      primaryVariant={Variant.Primary}
      primaryColor={Color.Red}
      onPrimary={handleLeave}
      onSecondary={onClose}
      secondaryText='Cancel'
      secondaryVariant={Variant.Primary}
      secondaryColor={Color.Greyscale}
      onClose={onClose}
      isProcessing={leaveTokenGatedChannel.isPending}
    >
      <div className={styles.LeaveDialogContainer}>
        {leaveTokenGatedChannel.isError ? (
          <div className={styles.ErrorMessage}>
            {(leaveTokenGatedChannel.error as any)?.code === 'CREATOR_CANNOT_LEAVE'
              ? 'Channel creator cannot leave the channel'
              : 'Failed to leave channel. Please try again.'}
          </div>
        ) : (
          <div>Are you sure you want to leave this channel?</div>
        )}
      </div>
    </Modal>
  );
};
