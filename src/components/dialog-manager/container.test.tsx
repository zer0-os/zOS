import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { RootState } from '../../store/reducer';
import { SecureBackupContainer } from '../secure-backup/container';
import { closeBackupDialog } from '../../store/matrix';
import { LogoutConfirmationModalContainer } from '../logout-confirmation-modal/container';
import { RewardsModalContainer } from '../rewards-modal/container';
import { closeRewardsDialog } from '../../store/rewards';
import { DeleteMessageContainer } from '../delete-message-dialog/container';
import { closeDeleteMessage } from '../../store/dialogs';
import { ReportUserContainer } from '../report-user-dialog/container';
import { closeReportUserModal } from '../../store/report-user';

describe('DialogManager', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      displayLogoutModal: false,
      isBackupDialogOpen: false,
      isRewardsDialogOpen: false,
      deleteMessageId: null,
      isReportUserModalOpen: false,
      closeBackupDialog: () => null,
      closeRewardsDialog: () => null,
      closeDeleteMessage: () => null,
      closeReportUserModal: () => null,

      ...props,
    };
    return shallow(<Container {...allProps} />);
  };

  it('renders SecureBackupContainer when isBackupDialogOpen is true', () => {
    const wrapper = subject({ isBackupDialogOpen: true });

    expect(wrapper).toHaveElement(SecureBackupContainer);
  });

  it('does not render SecureBackupContainer when isBackupDialogOpen is false', () => {
    const wrapper = subject({ isBackupDialogOpen: false });

    expect(wrapper).not.toHaveElement(SecureBackupContainer);
  });

  it('calls closeBackupDialog on closeBackup method', () => {
    const closeBackupDialogMock = jest.fn();
    const wrapper = subject({ closeBackupDialog: closeBackupDialogMock });

    const instance = wrapper.instance() as Container;
    instance.closeBackup();

    expect(closeBackupDialogMock).toHaveBeenCalled();
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
    const wrapper = subject({ deleteMessageId: 123 });

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

  describe('mapState', () => {
    const stateMock: RootState = {
      authentication: {
        displayLogoutModal: true,
      },
      matrix: {
        isBackupDialogOpen: true,
      },
      rewards: {
        showRewardsInPopup: false,
      },
      dialogs: {
        deleteMessageId: 123,
      },
      reportUser: {
        isReportUserModalOpen: true,
      },
    } as RootState;

    it('returns isBackupDialogOpen', () => {
      const props = Container.mapState(stateMock);

      expect(props.isBackupDialogOpen).toBe(true);
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

      expect(props.deleteMessageId).toBe(123);
    });

    it('returns isReportUserModalOpen', () => {
      const props = Container.mapState(stateMock);

      expect(props.isReportUserModalOpen).toBe(true);
    });
  });

  describe('mapActions', () => {
    it('returns closeBackupDialog action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.closeBackupDialog).toBeDefined();
      expect(actions.closeBackupDialog).toEqual(closeBackupDialog);
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
  });
});
