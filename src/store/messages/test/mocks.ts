import { Message, MessageSendStatus } from '..';

export const mockMessage = (msg: Partial<Message>): Message => ({
  id: '1',
  message: 'Hello, world!',
  createdAt: 1715769600,
  updatedAt: 1715769600,
  sender: {
    userId: '1',
    matrixId: '1',
    firstName: 'John',
    lastName: 'Doe',
    profileImage: 'https://example.com/profile.jpg',
    profileId: '1',
    primaryZID: '1',
    displaySubHandle: 'John Doe',
  },
  isAdmin: false,
  sendStatus: MessageSendStatus.SUCCESS,
  readBy: [],
  isPost: false,
  reactions: {},
  isHidden: false,
  mentionedUsers: [],
  hidePreview: false,
  ...msg,
});
