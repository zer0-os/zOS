import { RoomMember } from 'matrix-js-sdk/lib/models/room-member';
import { Channel, ConversationStatus } from '../../../store/channels';
import matrixClientInstance from './matrix-client-instance';
import { IN_ROOM_MEMBERSHIP_STATES } from './types';
import { Room } from 'matrix-js-sdk/lib/models/room';
import { NotificationCountType } from 'matrix-js-sdk/lib/models/room';
import { User } from '../../../store/channels';
import { User as MatrixUser } from 'matrix-js-sdk/lib/models/user';
import { MembershipStateType } from './types';
import { extractUserIdFromMatrixId } from './utils';

export class MatrixAdapter {
  public static async matrixInitialized() {
    await matrixClientInstance.connectionAwaiter;
  }

  /**
   * Returns a list of room ids that the user is a member of
   * @returns string[]
   */
  public static getChannelIds(): string[] {
    const rooms = matrixClientInstance.matrix.getRooms();
    return rooms
      .filter((room) => IN_ROOM_MEMBERSHIP_STATES.includes(room.getMyMembership()))
      .map(({ roomId }) => roomId);
  }

  /**
   * Returns a list of channels that the user is a member of
   * @returns Partial<Channel>[]
   */
  public static getChannels(): Partial<Channel>[] {
    return matrixClientInstance.matrix
      .getRooms()
      .filter((room) => IN_ROOM_MEMBERSHIP_STATES.includes(room.getMyMembership()))
      .map((room) => MatrixAdapter.mapRoomToChannel(room));
  }

  /**
   * Maps a room to a channel with the data we can get from Matrix
   * @param room - The room to map
   * @returns Partial<Channel>
   */
  public static mapRoomToChannel(room: Room): Partial<Channel> {
    const icon = matrixClientInstance.getRoomAvatar(room);
    const createdAt = matrixClientInstance.getRoomCreatedAt(room);
    const labels = Object.keys(room.tags || {});
    const [admins, mods] = matrixClientInstance.getRoomAdminsAndMods(room);
    const unreadCount = {
      total: room.getUnreadNotificationCount(),
      highlight: room.getUnreadNotificationCount(NotificationCountType.Highlight),
    };

    let members: User[] = [];
    let otherMembers: User[] = [];

    room.getMembers().forEach((member: RoomMember) => {
      const status = member.membership === MembershipStateType.Join || member.membership === MembershipStateType.Invite;
      const matrixUser = matrixClientInstance.matrix.getUser(member.userId);
      if (!matrixUser) return;

      if (status && member.userId !== room.myUserId) {
        otherMembers.push(MatrixAdapter.mapMatrixUserToUser(matrixUser));
      }
      members.push(MatrixAdapter.mapMatrixUserToUser(matrixUser));
    });

    return {
      id: room.roomId,
      name: room.name,
      bumpStamp: room.getBumpStamp(),
      icon,
      otherMembers,
      memberHistory: otherMembers,
      createdAt,
      unreadCount,
      conversationStatus: ConversationStatus.CREATED,
      isOneOnOne: room.getMembers().length === 2,
      adminMatrixIds: admins,
      moderatorIds: mods,
      labels,
    };
  }

  public static mapMatrixUserToUser(matrixUser: MatrixUser): User {
    return {
      userId: extractUserIdFromMatrixId(matrixUser.userId),
      matrixId: matrixUser.userId,
      firstName: matrixUser?.displayName,
      lastName: '',
      profileId: '',
      isOnline: false,
      profileImage: matrixUser?.avatarUrl,
      lastSeenAt: '',
      primaryZID: '',
    };
  }
}
