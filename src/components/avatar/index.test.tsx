import React from 'react';
import { shallow } from 'enzyme';

import { Avatar, AvatarBadge, AvatarProps } from './';
import { Status } from './status';
import { IconCurrencyEthereum, IconUsers1 } from '@zero-tech/zui/icons';

describe('Avatar', () => {
  const subject = (props: Partial<AvatarProps>) => {
    const allProps: AvatarProps = {
      size: 'regular',
      ...props,
    };

    return shallow(<Avatar {...allProps} />);
  };

  describe('when using default props', () => {
    it('should be regular size', () => {
      const wrapper = subject({});
      expect(wrapper).toHaveProp('data-size', 'regular');
    });

    it('should be medium size', () => {
      const wrapper = subject({ size: 'medium' });
      expect(wrapper).toHaveProp('data-size', 'medium');
    });

    it('should be small size', () => {
      const wrapper = subject({ size: 'small' });
      expect(wrapper).toHaveProp('data-size', 'small');
    });

    it('should be extra small size', () => {
      const wrapper = subject({ size: 'extra small' });
      expect(wrapper).toHaveProp('data-size', 'extra small');
    });
  });

  describe('when status type is "active"', () => {
    it('should show status active', () => {
      const wrapper = subject({ statusType: 'active' });
      expect(wrapper.find(Status)).toHaveProp('type', 'active');
    });
  });

  describe('when badge content is "9+"', () => {
    it('should show badge', () => {
      const wrapper = subject({ badgeContent: '9+' });
      expect(wrapper.find(AvatarBadge)).toHaveProp('badgeContent', '9+');
    });
  });

  describe('when image is available', () => {
    it('should render the image element', () => {
      const wrapper = subject({ imageURL: 'https://example.com/image.jpg' });
      expect(wrapper.find('img')).toHaveProp('src', 'https://example.com/image.jpg');
    });
  });

  describe('when image is not available', () => {
    it('should render the fallback icon', () => {
      const wrapper = subject({});
      expect(wrapper.find(IconCurrencyEthereum)).toExist();
    });
  });

  describe('when isGroup is true', () => {
    it('should render the group icon', () => {
      const wrapper = subject({ isGroup: true });
      expect(wrapper.find(IconUsers1)).toExist();
      expect(wrapper.find(IconCurrencyEthereum)).not.toExist();
    });
  });

  describe('when tabIndex is not specified (default value)', () => {
    it('should have tabIndex attribute set to 0', () => {
      const wrapper = subject({});
      expect(wrapper).toHaveProp('tabIndex', 0);
    });
  });

  describe('when tabIndex is set to -1', () => {
    it('should have tabIndex attribute set to -1', () => {
      const wrapper = subject({ tabIndex: -1 });
      expect(wrapper).toHaveProp('tabIndex', -1);
    });
  });

  describe('when size is extra small', () => {
    it('should not show status even if provided', () => {
      const wrapper = subject({ size: 'extra small', statusType: 'active' });
      expect(wrapper.find(Status)).not.toExist();
    });

    it('should not show badge even if provided', () => {
      const wrapper = subject({ size: 'extra small', badgeContent: '9+' });
      expect(wrapper.find('.Badge')).not.toExist();
    });
  });
});
