import { shallow } from 'enzyme';

import { EditConversationPanel, Properties } from '.';
import { ImageUpload } from '../../../image-upload';
import { buttonLabelled } from '../../../../test/utils';
import { Alert } from '@zero-tech/zui/components';

describe(EditConversationPanel, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onBack: () => null,
      errors: {},
      conversation: {} as any,
      ...props,
    };

    return shallow(<EditConversationPanel {...allProps} />);
  };

  describe('Edit Group Icon & Name', () => {
    it('renders body with ImageUpload and Input', () => {
      const wrapper = subject({ conversation: { name: 'Display Name', icon: 'icon-url' } as any });
      expect(wrapper.find('.edit-conversation-panel__body').length).toEqual(1);
      expect(wrapper.find(ImageUpload).props().imageSrc).toEqual('icon-url');
      expect(wrapper.find('Input[name="name"]').props().label).toEqual('Display Name');
    });

    it('disables Save Changes button when name is empty', () => {
      const wrapper = subject({ conversation: { name: '', icon: '' } as any });
      expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
    });

    it('disables Save Changes button when no changes are made', () => {
      const wrapper = subject({ conversation: { name: 'Display Name', icon: 'icon-url' } as any });

      expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
    });

    it('enables Save Changes button when changes are made', () => {
      const wrapper = subject({ conversation: { name: 'Display Name', icon: 'icon-url' } as any });

      wrapper.find('Input[name="name"]').simulate('change', 'Jane Smith');
      expect(saveButton(wrapper).prop('isDisabled')).toEqual(false);
    });

    it('renders name error when name is empty', () => {
      const wrapper = subject({ conversation: { name: '', icon: 'some-url' } as any });

      expect(wrapper.find('Input[name="name"]').prop('alert')).toEqual({
        variant: 'error',
        text: 'name cannot be empty',
      });
    });

    it('does not render name error when name is not empty', () => {
      const wrapper = subject({ conversation: { name: 'John Doe' } as any });

      expect(wrapper.find('Input[name="name"]').prop('alert')).toBeNull();
    });

    it('renders general errors', () => {
      const wrapper = subject({ errors: { general: 'invalid' } });

      expect(wrapper.find(Alert).prop('children')).toEqual('invalid');
    });
  });
});

function saveButton(wrapper) {
  return buttonLabelled(wrapper, 'Save');
}
