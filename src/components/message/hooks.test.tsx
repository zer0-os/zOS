/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react-hooks';
import { MediaDownloadStatus } from '../../store/messages';
import { MediaType } from '../../store/messages';
import { MessagesFetchState } from '../../store/channels';
import { useLoadAttachmentEffect } from './hooks/useLoadAttachmentEffect';
import { useContextMenu } from './hooks/useContextMenu';

describe('loadAttachmentEffect', () => {
  it('calls loadAttachmentDetails if no media url and messagesFetchStatus is success', () => {
    const loadAttachmentDetails = jest.fn();
    const media = { url: null, type: MediaType.Image, height: 100, width: 100, name: 'test-name' };
    const messageId = 'test-id';

    renderHook(() => useLoadAttachmentEffect(media, messageId, loadAttachmentDetails, MessagesFetchState.SUCCESS));

    expect(loadAttachmentDetails).toHaveBeenCalledWith({
      media,
      messageId,
    });
  });

  it('calls loadAttachmentDetails if url is a matrix media url and messagesFetchStatus is success', () => {
    const loadAttachmentDetails = jest.fn();
    const media = {
      url: 'mxc://some-test-matrix-url',
      type: MediaType.Image,
      height: 100,
      width: 100,
      name: 'test-name',
    };
    const messageId = 'test-id';

    renderHook(() => useLoadAttachmentEffect(media, messageId, loadAttachmentDetails, MessagesFetchState.SUCCESS));

    expect(loadAttachmentDetails).toHaveBeenCalledWith({
      media,
      messageId,
    });
  });

  it('does not call loadAttachmentDetails if messagesFetchStatus is not success', () => {
    const loadAttachmentDetails = jest.fn();
    const media = { url: null, type: MediaType.Image, height: 100, width: 100, name: 'test-name' };
    const messageId = 'test-id';

    renderHook(() => useLoadAttachmentEffect(media, messageId, loadAttachmentDetails, MessagesFetchState.FAILED));

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });

  it('does not call loadAttachmentDetails if url is defined and not a matrix media url', () => {
    const loadAttachmentDetails = jest.fn();
    const media = {
      url: 'some-test-url',
      type: MediaType.Image,
      downloadStatus: MediaDownloadStatus.Failed,
      height: 100,
      width: 100,
      name: 'test-name',
    };
    const messageId = 'test-id';

    renderHook(() => useLoadAttachmentEffect(media, messageId, loadAttachmentDetails, MessagesFetchState.SUCCESS));

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });

  it('does not call loadAttachmentDetails if media download status is failed', () => {
    const loadAttachmentDetails = jest.fn();
    const media = {
      url: null,
      type: MediaType.Image,
      downloadStatus: MediaDownloadStatus.Failed,
      height: 100,
      width: 100,
      name: 'test-name',
    };
    const messageId = 'test-id';

    renderHook(() => useLoadAttachmentEffect(media, messageId, loadAttachmentDetails, MessagesFetchState.SUCCESS));

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });

  it('does not call loadAttachmentDetails if media download status is loading', () => {
    const loadAttachmentDetails = jest.fn();
    const media = {
      url: null,
      type: MediaType.Image,
      downloadStatus: MediaDownloadStatus.Loading,
      height: 100,
      width: 100,
      name: 'test-name',
    };
    const messageId = 'test-id';

    renderHook(() => useLoadAttachmentEffect(media, messageId, loadAttachmentDetails, MessagesFetchState.SUCCESS));

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });

  it('does not call loadAttachmentDetails if media mime type is an image', () => {
    const loadAttachmentDetails = jest.fn();
    const media = {
      url: null,
      type: MediaType.Image,
      height: 100,
      width: 100,
      name: 'test-name',
      mimetype: 'image/png',
    };
    const messageId = 'test-id';

    renderHook(() => useLoadAttachmentEffect(media, messageId, loadAttachmentDetails, MessagesFetchState.SUCCESS));

    expect(loadAttachmentDetails).not.toHaveBeenCalled();
  });
});

describe('useContextMenu', () => {
  it('should not trigger menu when text is selected', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useContextMenu({ onOpen }));

    // Mock window.getSelection to return selected text
    const mockSelection = {
      toString: () => 'selected text',
    };
    Object.defineProperty(window, 'getSelection', {
      value: () => mockSelection,
    });

    const event = {
      button: 2,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      pageX: 100,
      pageY: 200,
    };

    result.current.handler(event as any);

    expect(onOpen).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it('should trigger menu on right click with no text selected', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useContextMenu({ onOpen }));

    // Mock window.getSelection to return no selected text
    const mockSelection = {
      toString: () => '',
    };
    Object.defineProperty(window, 'getSelection', {
      value: () => mockSelection,
    });

    const event = {
      button: 2,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      pageX: 100,
      pageY: 200,
    };

    result.current.handler(event as any);

    expect(onOpen).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(result.current.position).toEqual({ x: 100, y: 200 });
  });

  it('should not trigger menu on left click', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useContextMenu({ onOpen }));

    // Mock window.getSelection to return no selected text
    const mockSelection = {
      toString: () => '',
    };
    Object.defineProperty(window, 'getSelection', {
      value: () => mockSelection,
    });

    const event = {
      button: 0, // Left click
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      pageX: 100,
      pageY: 200,
    };

    result.current.handler(event as any);

    expect(onOpen).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });
});
