import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { RootState } from '../../store/reducer';
import { SecureBackupContainer } from '../secure-backup/container';
import { closeBackupDialog } from '../../store/matrix';
import { LogoutConfirmationModalContainer } from '../logout-confirmation-modal/container';
import { RewardsModalContainer } from '../rewards-modal/container';
import { closeRewardsDialog } from '../../store/rewards';

describe('DialogManager', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      displayLogoutModal: false,
      isBackupDialogOpen: false,
      isRewardsDialogOpen: false,

      closeBackupDialog: () => null,
      closeRewardsDialog: () => null,
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
  });
});
