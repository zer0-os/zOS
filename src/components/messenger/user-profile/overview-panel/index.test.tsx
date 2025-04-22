/**
 * @jest-environment jsdom
 */

import { mount } from 'enzyme';
import { act } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { OverviewPanel, Properties } from '.';

import { Image, Modal } from '@zero-tech/zui/components';
import { Button } from '@zero-tech/zui/components/Button';
import {
  IconCurrencyEthereum,
  IconLink1,
  IconDownload2,
  IconLock1,
  IconSettings2,
  IconUser1,
  IconWallet3,
} from '@zero-tech/zui/icons';

import { bem } from '../../../../lib/bem';

const c = bem('.overview-panel');

const featureFlags = { enableRewards: false, enableUserSettings: false, enableLinkedAccounts: false };

const queryClient = new QueryClient();

jest.mock('../../../../lib/feature-flags', () => ({
  featureFlags: featureFlags,
}));
jest.mock('./rewards-item/container', () => ({
  RewardsItemContainer: () => null, // Mock implementation returns null
}));
jest.mock('../../../../lib/hooks/useMatrixImage', () => ({
  useMatrixImage: (image: string) => ({ data: image }), // Mock hook returns the input directly
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

    return mount(
      <QueryClientProvider client={queryClient}>
        <OverviewPanel {...allProps} />
      </QueryClientProvider>
    );
  };

  it('publishes onBack event', () => {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find('.messenger-panel__back').prop('onClick')({ preventDefault: () => {} } as React.MouseEvent);
    expect(onBack).toHaveBeenCalled();
  });

  it('publishes onOpenLogoutDialog event', () => {
    const onOpenLogoutDialog = jest.fn();
    const wrapper = subject({ onOpenLogoutDialog });

    const className = c('footer-button');
    const button = wrapper.find(className).first();
    // @ts-ignore
    button.prop('onPress')();

    expect(onOpenLogoutDialog).toHaveBeenCalled();
  });

  it('publishes onOpenEditProfile event', () => {
    const onOpenEditProfile = jest.fn();
    const wrapper = subject({ onOpenEditProfile });

    wrapper
      .find(Button)
      .filterWhere((n) => (n.prop('startEnhancer') as React.ReactElement)?.type === IconUser1)
      .prop('onPress')();

    expect(onOpenEditProfile).toHaveBeenCalled();
  });

  it('publishes onOpenBackupDialog event', () => {
    const onOpenBackupDialog = jest.fn();
    const wrapper = subject({ onOpenBackupDialog });

    wrapper
      .find(Button)
      .filterWhere((n) => (n.prop('startEnhancer') as React.ReactElement)?.type === IconLock1)
      .prop('onPress')();

    expect(onOpenBackupDialog).toHaveBeenCalled();
  });

  it('publishes onOpenRewards event', () => {
    featureFlags.enableRewards = true;

    const onOpenRewards = jest.fn();
    const wrapper = subject({ onOpenRewards });

    wrapper.find(c('rewards')).prop('onClick')({ preventDefault: () => {} } as React.MouseEvent);

    expect(onOpenRewards).toHaveBeenCalled();
  });

  it('publishes onOpenSettings event', () => {
    featureFlags.enableUserSettings = true;

    const onOpenSettings = jest.fn();
    const wrapper = subject({ onOpenSettings });

    wrapper
      .find(Button)
      .filterWhere((n) => (n.prop('startEnhancer') as React.ReactElement)?.type === IconSettings2)
      .prop('onPress')();

    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('publishes onOpenDownloads event', () => {
    featureFlags.enableUserSettings = true;

    const onOpenDownloads = jest.fn();
    const wrapper = subject({ onOpenDownloads });

    wrapper
      .find(Button)
      .filterWhere((n) => (n.prop('startEnhancer') as React.ReactElement)?.type === IconDownload2)
      .prop('onPress')();

    expect(onOpenDownloads).toHaveBeenCalled();
  });

  it('publishes openAccountManagement event', () => {
    const onOpenAccountManagement = jest.fn();
    const wrapper = subject({ onManageAccounts: onOpenAccountManagement });

    wrapper
      .find(Button)
      .filterWhere((n) => (n.prop('startEnhancer') as React.ReactElement)?.type === IconWallet3)
      .prop('onPress')();

    expect(onOpenAccountManagement).toHaveBeenCalled();
  });

  it('publishes onOpenLinkedAccounts event', () => {
    featureFlags.enableLinkedAccounts = true;

    const onOpenLinkedAccounts = jest.fn();
    const wrapper = subject({ onOpenLinkedAccounts });

    wrapper
      .find(Button)
      .filterWhere((n) => (n.prop('startEnhancer') as React.ReactElement)?.type === IconLink1)
      .prop('onPress')();

    expect(onOpenLinkedAccounts).toHaveBeenCalled();
  });

  it('opens the invite dialog', () => {
    const wrapper = subject({});

    act(() => {
      wrapper.find(Button).at(0).prop('onPress')();
    });
    wrapper.update();

    expect(wrapper.find(Modal).prop('open')).toBe(true);
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
