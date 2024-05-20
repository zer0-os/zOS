import { shallow } from 'enzyme';
import { DeleteMessageModal, Properties } from '.';
import { Button } from '@zero-tech/zui/components/Button';
import { IconButton } from '@zero-tech/zui/components';

describe(DeleteMessageModal, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onDelete: jest.fn(),
      onClose: jest.fn(),
      ...props,
    };

    return shallow(<DeleteMessageModal {...allProps} />);
  };

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(IconButton).simulate('click');

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onDelete and onClose when the delete button is clicked', () => {
    const onDelete = jest.fn();
    const onClose = jest.fn();
    const wrapper = subject({ onDelete, onClose });

    wrapper.find(Button).at(1).simulate('press');

    expect(onDelete).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the cancel button is clicked', () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(Button).at(0).simulate('press');

    expect(onClose).toHaveBeenCalled();
  });
});
