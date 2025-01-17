import { shallow } from 'enzyme';

import { OverviewPanel, Properties } from '.';
import { PanelHeader } from '../../list/panel-header';

import { Image } from '@zero-tech/zui/components';
import { Button } from '@zero-tech/zui/components/Button';
import { IconCurrencyEthereum } from '@zero-tech/zui/icons';

import { bem } from '../../../../lib/bem';

const c = bem('.overview-panel');

const featureFlags = { enableRewards: false, enableUserSettings: false, enableLinkedAccounts: false };

jest.mock('../../../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));

describe(OverviewPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      name: '',
      image: '',
      subHandle: '',

      onBack: () => {},
      onOpenLogoutDialog: () => {},
      onOpenBackupDialog: () => {},
      onOpenEditProfile: () => {},
      onOpenRewards: () => {},
      onOpenSettings: () => {},
      onOpenDownloads: () => {},
      onManageAccounts: () => {},
      onOpenLinkedAccounts: () => {},

      ...props,
    };

    return shallow(<OverviewPanel {...allProps} />);
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalled();
  });

  it('publishes onOpenLogoutDialog event', () => {
    const onOpenLogoutDialog = jest.fn();
    const wrapper = subject({ onOpenLogoutDialog });

    wrapper.find(c('footer-button')).simulate('press');

    expect(onOpenLogoutDialog).toHaveBeenCalled();
  });

  it('publishes onOpenEditProfile event', () => {
    const onOpenEditProfile = jest.fn();
    const wrapper = subject({ onOpenEditProfile });

    wrapper.find(Button).at(1).simulate('press');

    expect(onOpenEditProfile).toHaveBeenCalled();
  });

  it('publishes onOpenBackupDialog event', () => {
    const onOpenBackupDialog = jest.fn();
    const wrapper = subject({ onOpenBackupDialog });

    wrapper.find(Button).at(3).simulate('press');

    expect(onOpenBackupDialog).toHaveBeenCalled();
  });

  it('publishes onOpenRewards event', () => {
    featureFlags.enableRewards = true;

    const onOpenRewards = jest.fn();
    const wrapper = subject({ onOpenRewards });

    wrapper.find(c('rewards')).simulate('click');

    expect(onOpenRewards).toHaveBeenCalled();
  });

  it('publishes onOpenSettings event', () => {
    featureFlags.enableUserSettings = true;

    const onOpenSettings = jest.fn();
    const wrapper = subject({ onOpenSettings });

    wrapper.find(Button).at(4).simulate('press');

    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('publishes onOpenDownloads event', () => {
    featureFlags.enableUserSettings = true;

    const onOpenDownloads = jest.fn();
    const wrapper = subject({ onOpenDownloads });

    wrapper.find(Button).at(5).simulate('press');

    expect(onOpenDownloads).toHaveBeenCalled();
  });

  it('publishes openAccountManagement event', () => {
    const onOpenAccountManagement = jest.fn();
    const wrapper = subject({ onManageAccounts: onOpenAccountManagement });

    wrapper.find(Button).at(2).simulate('press');

    expect(onOpenAccountManagement).toHaveBeenCalled();
  });

  it('publishes onOpenLinkedAccounts event', () => {
    featureFlags.enableLinkedAccounts = true;

    const onOpenLinkedAccounts = jest.fn();
    const wrapper = subject({ onOpenLinkedAccounts });

    wrapper.find(Button).at(6).simulate('press');

    expect(onOpenLinkedAccounts).toHaveBeenCalled();
  });

  it('opens the invite dialog', () => {
    const wrapper = subject({});

    wrapper.find(Button).at(0).simulate('press');

    expect(wrapper).toHaveState('isInviteDialogOpen', true);
  });

  it('renders subhandle when subhandle prop is provided', () => {
    const wrapper = subject({ subHandle: '0://subhandle' });
    expect(wrapper.find(c('sub-handle'))).toHaveText('0://subhandle');
  });

  it('renders custom image when image prop is provided', () => {
    const wrapper = subject({ image: 'image-url' });
    expect(wrapper.find(Image)).toHaveProp('src', 'image-url');
    expect(wrapper).not.toHaveElement(IconCurrencyEthereum);
  });

  it('renders default image when image prop is not provided', () => {
    const wrapper = subject({ image: '' });
    expect(wrapper).toHaveElement(IconCurrencyEthereum);
  });
});
