import { shallow } from 'enzyme';

import { EditConversationPanel, Properties } from '.';
import { ImageUpload } from '../../../image-upload';
import { buttonLabelled } from '../../../../test/utils';
import { Alert } from '@zero-tech/zui/components';
import { CitizenListItem } from '../../../citizen-list-item';
import { User } from '../../../../store/channels';

describe(EditConversationPanel, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      currentUser: { userId: 'current-user' } as User,
      otherMembers: [],
      onBack: () => null,
      errors: {},
      name: '',
      icon: '',
      ...props,
    };

    return shallow(<EditConversationPanel {...allProps} />);
  };

  describe('Edit Group Icon & Name', () => {
    it('renders body with ImageUpload and Input', () => {
      const wrapper = subject({ name: 'Display Name', icon: 'icon-url' });
      expect(wrapper.find('.edit-conversation-panel__body').length).toEqual(1);
      expect(wrapper.find(ImageUpload).props().imageSrc).toEqual('icon-url');
      expect(wrapper.find('Input[name="name"]').props().label).toEqual('Display Name');
    });

    it('disables Save Changes button when name is empty', () => {
      const wrapper = subject({ name: '', icon: '' });
      expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
    });

    it('disables Save Changes button when no changes are made', () => {
      const wrapper = subject({ name: 'Display Name', icon: 'icon-url' });

      expect(saveButton(wrapper).prop('isDisabled')).toEqual(true);
    });

    it('enables Save Changes button when changes are made', () => {
      const wrapper = subject({ name: 'Display Name', icon: 'icon-url' });

      wrapper.find('Input[name="name"]').simulate('change', 'Jane Smith');
      expect(saveButton(wrapper).prop('isDisabled')).toEqual(false);
    });

    it('renders name error when name is empty', () => {
      const wrapper = subject({ name: '', icon: 'some-url' });

      expect(wrapper.find('Input[name="name"]').prop('alert')).toEqual({
        variant: 'error',
        text: 'name cannot be empty',
      });
    });

    it('does not render name error when name is not empty', () => {
      const wrapper = subject({ name: 'John Doe' });

      expect(wrapper.find('Input[name="name"]').prop('alert')).toBeNull();
    });

    it('renders general errors', () => {
      const wrapper = subject({ errors: { general: 'invalid' } });

      expect(wrapper.find(Alert).prop('children')).toEqual('invalid');
    });
  });

  describe('Members', () => {
    it('renders the members of the conversation', function () {
      const wrapper = subject({
        currentUser: { userId: 'Admin' } as any,
        otherMembers: [{ userId: '1' }, { userId: '2' }, { userId: '3' }] as any,
      });

      expect(wrapper.find(CitizenListItem).map((c) => c.prop('user'))).toEqual([
        { userId: 'Admin' },
        { userId: '1' },
        { userId: '2' },
        { userId: '3' },
      ]);
    });
  });
});

function saveButton(wrapper) {
  return buttonLabelled(wrapper, 'Save');
}
