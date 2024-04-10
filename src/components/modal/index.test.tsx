import { shallow } from 'enzyme';

import { Color, Modal, Properties, Variant } from '.';
import { bem } from '../../lib/bem';
import { buttonLabelled } from '../../test/utils';

const c = bem('.modal');

describe(Modal, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      title: 'stub title',
      primaryVariant: Variant.Primary,
      primaryColor: Color.Highlight,
      primaryText: 'Primary',
      secondaryVariant: Variant.Secondary,
      secondaryColor: Color.Greyscale,
      secondaryText: 'Secondary',
      onPrimary: () => null,
      onSecondary: () => null,
      onClose: () => null,

      ...props,
    };

    return shallow(<Modal {...allProps} />);
  };

  it('renders the title', function () {
    const wrapper = subject({ title: 'My Modal' });

    expect(wrapper.find(c('title'))).toHaveText('My Modal');
  });

  it('publishes close event when X clicked', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('IconButton').simulate('click');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes close event modal announces an open change', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('Modal').simulate('openChange', false);

    expect(onClose).toHaveBeenCalled();
  });

  it('renders primary button as configured', function () {
    const wrapper = subject({
      primaryVariant: Variant.Primary,
      primaryText: 'action',
      primaryDisabled: true,
    });

    const button = buttonLabelled(wrapper, 'action');

    expect(button).toHaveProp('variant', Variant.Primary);
    expect(button).toHaveProp('isDisabled', true);
  });

  it('renders primary button as primary variant', function () {
    const wrapper = subject({
      primaryVariant: Variant.Primary,
      primaryText: 'action',
    });

    expect(buttonLabelled(wrapper, 'action')).toHaveProp('variant', 'primary');
  });

  it('publishes primary event', function () {
    const onPrimary = jest.fn();
    const wrapper = subject({ onPrimary, primaryText: 'Primary Action' });

    buttonLabelled(wrapper, 'Primary Action').simulate('press');

    expect(onPrimary).toHaveBeenCalled();
  });

  it('renders secondary button as configured', function () {
    const wrapper = subject({
      secondaryVariant: Variant.Secondary,
      secondaryText: 'action',
      secondaryDisabled: true,
    });

    expect(buttonLabelled(wrapper, 'action')).toHaveProp('variant', 'secondary');
    expect(buttonLabelled(wrapper, 'action')).toHaveProp('isDisabled', true);
  });

  it('renders secondary button as secondary variant', function () {
    const wrapper = subject({
      secondaryVariant: Variant.Secondary,
      secondaryText: 'action',
    });

    expect(buttonLabelled(wrapper, 'action')).toHaveProp('variant', 'secondary');
  });

  it('publishes secondary event', function () {
    const onSecondary = jest.fn();
    const wrapper = subject({ onSecondary, secondaryText: 'Secondary Action' });

    buttonLabelled(wrapper, 'Secondary Action').simulate('press');

    expect(onSecondary).toHaveBeenCalled();
  });

  it('does not render primary button if no action exists', function () {
    const wrapper = subject({ onPrimary: undefined, primaryText: 'Primary Action' });

    expect(buttonLabelled(wrapper, 'Primary Action').exists()).toBe(false);
  });

  it('does not render secondary button if no action exists', function () {
    const wrapper = subject({ onSecondary: undefined, secondaryText: 'Secondary Action' });

    expect(buttonLabelled(wrapper, 'Secondary Action').exists()).toBe(false);
  });

  it('sets loading state on primary button', function () {
    const wrapper = subject({ isProcessing: true, onPrimary: () => null, primaryText: 'Primary' });

    expect(buttonLabelled(wrapper, 'Primary')).toHaveProp('isLoading', true);
  });
});
