import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { MessageMenu, Properties } from '.';

describe('Message Menu', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const defaultProps = {
      className: '',
      canEdit: false,
      canDelete: false,
      canReply: false,
      canViewInfo: false,
      isMediaMessage: false,
      isMenuOpen: false,
      onDelete: undefined,
      onEdit: undefined,
      onReply: undefined,
      onInfo: undefined,
      onOpenChange: undefined,
      onCloseMenu: undefined,
      ...props,
    };

    return shallow(<MessageMenu {...defaultProps} />);
  };

  describe('ClassName', () => {
    it('adds className', () => {
      const onDelete = jest.fn();
      const wrapper = subject({ className: 'message-menu', onDelete, canDelete: true });

      expect(wrapper.hasClass('message-menu')).toBe(true);
    });
  });

  describe('Delete Button', () => {
    it('should render when canDelete is true and onDelete is provided', () => {
      const onDelete = jest.fn();
      const wrapper = subject({ canDelete: true, onDelete }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const deleteItem = items.find((item) => item.id === 'delete');

      expect(deleteItem).toBeDefined();
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = jest.fn();
      const wrapper = subject({ canDelete: true, onDelete });

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const deleteItem = items.find((item) => item.id === 'delete');

      deleteItem.onSelect();

      expect(onDelete).toHaveBeenCalled();
    });
  });

  describe('Edit Button', () => {
    it('should render when canEdit is true', () => {
      const onEdit = jest.fn();
      const wrapper = subject({ canEdit: true, onEdit }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const editItem = items.find((item) => item.id === 'edit');

      expect(editItem).toBeDefined();
    });

    it('should call edit message when clicked after releasing the thread', async () => {
      const onEdit = jest.fn();
      const wrapper = subject({ canEdit: true, onEdit }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const editItem = items.find((item) => item.id === 'edit');

      editItem.onSelect();

      expect(onEdit).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Reply Button', () => {
    it('should render when canReply is true and isMediaMessage is false', () => {
      const onReply = jest.fn();
      const wrapper = subject({ canReply: true, onReply }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const replyItem = items.find((item) => item.id === 'reply');

      expect(replyItem).toBeDefined();
    });

    it('should call reply message when clicked after releasing the thread', async () => {
      const onReply = jest.fn();
      const wrapper = subject({ canReply: true, onReply }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const replyItem = items.find((item) => item.id === 'reply');

      replyItem.onSelect();
      expect(onReply).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(onReply).toHaveBeenCalled();
    });
  });

  describe('Info Button', () => {
    it('should render when canViewInfo is true and onInfo is provided', () => {
      const onInfo = jest.fn();
      const wrapper = subject({ canViewInfo: true, onInfo }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const infoItem = items.find((item) => item.id === 'info');

      expect(infoItem).toBeDefined();
    });

    it('should call onInfo when info button is clicked', () => {
      const onInfo = jest.fn();
      const wrapper = subject({ canViewInfo: true, onInfo }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const infoItem = items.find((item) => item.id === 'info');

      infoItem.onSelect();

      expect(onInfo).toHaveBeenCalled();
    });
  });
});
