import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { RootState } from '../../store/reducer';
import { closeRestoreBackupDialog, closeCreateBackupDialog } from '../../store/matrix';
import { LogoutConfirmationModalContainer } from '../logout-confirmation-modal/container';
import { RewardsModalContainer } from '../rewards-modal/container';
import { closeRewardsDialog } from '../../store/rewards';
import { DeleteMessageContainer } from '../delete-message-dialog/container';
import { closeDeleteMessage, closeLightbox } from '../../store/dialogs';
import { ReportUserContainer } from '../report-user-dialog/container';
import { closeReportUserModal } from '../../store/report-user';
import { Lightbox } from '../lightbox';
import { CreateSecureBackupContainer } from '../secure-backup/create-secure-backup/container';
import { RestoreSecureBackupContainer } from '../secure-backup/restore-secure-backup/container';

describe('DialogManager', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      displayLogoutModal: false,
      isCreateBackupDialogOpen: false,
      isRestoreBackupDialogOpen: false,
      isRewardsDialogOpen: false,
      deleteMessageId: null,
      isReportUserModalOpen: false,
      lightbox: {
        isOpen: false,
        media: [],
        startingIndex: 0,
      },
      closeCreateBackupDialog: () => null,
      closeRestoreBackupDialog: () => null,
      closeRewardsDialog: () => null,
      closeDeleteMessage: () => null,
      closeReportUserModal: () => null,
      closeLightbox: () => null,

      ...props,
    };
    return shallow(<Container {...allProps} />);
  };

  it('renders CreateSecureBackupContainer when isCreateBackupDialogOpen is true', () => {
    const wrapper = subject({ isCreateBackupDialogOpen: true });

    expect(wrapper).toHaveElement(CreateSecureBackupContainer);
  });

  it('does not render CreateSecureBackupContainer when isCreateBackupDialogOpen is false', () => {
    const wrapper = subject({ isCreateBackupDialogOpen: false });

    expect(wrapper).not.toHaveElement(CreateSecureBackupContainer);
  });

  it('calls closeCreateBackupDialog on closeBackup method', () => {
    const closeCreateBackupDialogMock = jest.fn();
    const wrapper = subject({ closeCreateBackupDialog: closeCreateBackupDialogMock });

    const instance = wrapper.instance() as Container;
    instance.closeCreateBackup();

    expect(closeCreateBackupDialogMock).toHaveBeenCalled();
  });

  it('renders RestoreSecureBackupContainer when isRestoreBackupDialogOpen is true', () => {
    const wrapper = subject({ isRestoreBackupDialogOpen: true });

    expect(wrapper).toHaveElement(RestoreSecureBackupContainer);
  });

  it('does not render RestoreSecureBackupContainer when isRestoreBackupDialogOpen is false', () => {
    const wrapper = subject({ isRestoreBackupDialogOpen: false });

    expect(wrapper).not.toHaveElement(RestoreSecureBackupContainer);
  });

  it('calls closeRestoreBackupDialog on closeRestoreBackup method', () => {
    const closeRestoreBackupDialogMock = jest.fn();
    const wrapper = subject({ closeRestoreBackupDialog: closeRestoreBackupDialogMock });

    const instance = wrapper.instance() as Container;
    instance.closeRestoreBackup();

    expect(closeRestoreBackupDialogMock).toHaveBeenCalled();
  });

  it('renders Logout Confirmation when displayLogoutModal is true', () => {
    const wrapper = subject({ displayLogoutModal: true });

    expect(wrapper).toHaveElement(LogoutConfirmationModalContainer);
  });

  it('does not render Logout Confirmation when displayLogoutModal is false', () => {
    const wrapper = subject({ displayLogoutModal: false });

    expect(wrapper).not.toHaveElement(LogoutConfirmationModalContainer);
  });

  it('renders Rewards Modal when isRewardsDialogOpen is true', () => {
    const wrapper = subject({ isRewardsDialogOpen: true });

    expect(wrapper).toHaveElement(RewardsModalContainer);
  });

  it('does not render Rewards Modal when isRewardsDialogOpen is false', () => {
    const wrapper = subject({ isRewardsDialogOpen: false });

    expect(wrapper).not.toHaveElement(RewardsModalContainer);
  });

  it('renders DeleteMessageContainer when deleteMessageId is present', () => {
    const wrapper = subject({ deleteMessageId: '123' });

    expect(wrapper).toHaveElement(DeleteMessageContainer);
  });

  it('does not render DeleteMessageContainer when deleteMessageId is absent', () => {
    const wrapper = subject({ deleteMessageId: null });

    expect(wrapper).not.toHaveElement(DeleteMessageContainer);
  });

  it('renders ReportUserContainer when isReportUserModalOpen is true', () => {
    const wrapper = subject({ isReportUserModalOpen: true });

    expect(wrapper).toHaveElement(ReportUserContainer);
  });

  it('does not render ReportUserContainer when isReportUserModalOpen is false', () => {
    const wrapper = subject({ isReportUserModalOpen: false });

    expect(wrapper).not.toHaveElement(ReportUserContainer);
  });

  it('renders Lightbox when lightbox.isOpen is true', () => {
    const wrapper = subject({
      lightbox: { isOpen: true, media: [], startingIndex: 0 },
    });

    expect(wrapper).toHaveElement(Lightbox);
  });

  it('does not render Lightbox when lightbox.isOpen is false', () => {
    const wrapper = subject({
      lightbox: { isOpen: false, media: [], startingIndex: 0 },
    });

    expect(wrapper).not.toHaveElement(Lightbox);
  });

  describe('mapState', () => {
    const stateMock: RootState = {
      authentication: {
        displayLogoutModal: true,
      },
      matrix: {
        isCreateBackupDialogOpen: true,
        isRestoreBackupDialogOpen: true,
      },
      rewards: {
        showRewardsInPopup: false,
      },
      dialogs: {
        deleteMessageId: '123',
        lightbox: {
          isOpen: true,
          media: [],
          startingIndex: 0,
        },
      },
      reportUser: {
        isReportUserModalOpen: true,
      },
    } as RootState;

    it('returns isCreateBackupDialogOpen', () => {
      const props = Container.mapState(stateMock);

      expect(props.isCreateBackupDialogOpen).toBe(true);
    });

    it('returns isRestoreBackupDialogOpen', () => {
      const props = Container.mapState(stateMock);

      expect(props.isRestoreBackupDialogOpen).toBe(true);
    });

    it('returns displayLogoutModal', () => {
      const props = Container.mapState(stateMock);

      expect(props.displayLogoutModal).toBe(true);
    });

    it('returns isRewardsDialogOpen', () => {
      const props = Container.mapState(stateMock);

      expect(props.isRewardsDialogOpen).toBe(false);
    });

    it('returns deleteMessageId', () => {
      const props = Container.mapState(stateMock);

      expect(props.deleteMessageId).toBe('123');
    });

    it('returns isReportUserModalOpen', () => {
      const props = Container.mapState(stateMock);

      expect(props.isReportUserModalOpen).toBe(true);
    });

    it('returns lightbox', () => {
      const props = Container.mapState(stateMock);

      expect(props.lightbox).toEqual({
        isOpen: true,
        media: [],
        startingIndex: 0,
      });
    });
  });

  describe('mapActions', () => {
    it('returns closeCreateBackupDialog action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.closeCreateBackupDialog).toBeDefined();
      expect(actions.closeCreateBackupDialog).toEqual(closeCreateBackupDialog);
    });

    it('returns closeRestoreBackupDialog action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.closeRestoreBackupDialog).toBeDefined();
      expect(actions.closeRestoreBackupDialog).toEqual(closeRestoreBackupDialog);
    });

    it('returns closeRewardsDialog action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.closeRewardsDialog).toBeDefined();
      expect(actions.closeRewardsDialog).toEqual(closeRewardsDialog);
    });

    it('returns closeDeleteMessage action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.closeDeleteMessage).toBeDefined();
      expect(actions.closeDeleteMessage).toEqual(closeDeleteMessage);
    });

    it('returns closeReportUserModal action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.closeReportUserModal).toBeDefined();
      expect(actions.closeReportUserModal).toEqual(closeReportUserModal);
    });

    it('returns closeLightbox action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.closeLightbox).toBeDefined();
      expect(actions.closeLightbox).toEqual(closeLightbox);
    });
  });
});
