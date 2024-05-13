import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { RootState } from '../../store/reducer';
import { SecureBackupContainer } from '../secure-backup/container';
import { closeBackupDialog } from '../../store/matrix';

describe('DialogContainer', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isBackupDialogOpen: false,

      closeBackupDialog: () => null,
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

  describe('mapState', () => {
    const stateMock: RootState = {
      matrix: {
        isBackupDialogOpen: true,
      },
    } as RootState;

    it('returns isBackupDialogOpen', () => {
      const props = Container.mapState(stateMock);

      expect(props.isBackupDialogOpen).toBe(true);
    });
  });

  describe('mapActions', () => {
    it('returns closeBackupDialog action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.closeBackupDialog).toBeDefined();
      expect(actions.closeBackupDialog).toEqual(closeBackupDialog);
    });
  });
});
