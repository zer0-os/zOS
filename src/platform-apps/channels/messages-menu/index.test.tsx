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
      canReportUser: false,
      canViewInfo: false,
      isMenuOpen: false,
      onDelete: undefined,
      onEdit: undefined,
      onReply: undefined,
      onInfo: undefined,
      onReportUser: undefined,
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
    it('should render when canReply is true', () => {
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

  describe('Report Button', () => {
    it('should render when canReportUser is true and onReportUser is provided', () => {
      const onReportUser = jest.fn();
      const wrapper = subject({ canReportUser: true, onReportUser }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const reportItem = items.find((item) => item.id === 'reportUser');

      expect(reportItem).toBeDefined();
    });

    it('should not render when canReportUser is false', () => {
      const wrapper = subject({ canReportUser: false }) as ShallowWrapper;

      expect(wrapper.find('DropdownMenu').exists()).toBe(false);
    });

    it('should call onReportUser when report button is clicked', () => {
      const onReportUser = jest.fn();
      const wrapper = subject({ canReportUser: true, onReportUser }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const reportItem = items.find((item) => item.id === 'reportUser');

      reportItem.onSelect();

      expect(onReportUser).toHaveBeenCalled();
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

  describe('Download Button', () => {
    it('should render when canDownload is true and onDownload is provided', () => {
      const onDownload = jest.fn();
      const wrapper = subject({ canDownload: true, onDownload }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const downloadItem = items.find((item) => item.id === 'download');

      expect(downloadItem).toBeDefined();
    });

    it('should call onDownload when download button is clicked', () => {
      const onDownload = jest.fn();
      const wrapper = subject({ canDownload: true, onDownload }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const downloadItem = items.find((item) => item.id === 'download');

      downloadItem.onSelect();

      expect(onDownload).toHaveBeenCalled();
    });
  });

  describe('Copy Button', () => {
    it('should render when canCopy is true and onCopy is provided', () => {
      const onCopy = jest.fn();
      const wrapper = subject({ canCopy: true, onCopy }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const copyItem = items.find((item) => item.id === 'copy');

      expect(copyItem).toBeDefined();
    });

    it('should call onCopy when copy button is clicked', () => {
      const onCopy = jest.fn();
      const wrapper = subject({ canCopy: true, onCopy }) as ShallowWrapper;

      const dropdownMenu = wrapper.find('DropdownMenu');
      const items = dropdownMenu.prop('items') as { id: string; onSelect: () => void }[];
      const copyItem = items.find((item) => item.id === 'copy');

      copyItem.onSelect();

      expect(onCopy).toHaveBeenCalled();
    });
  });
});
