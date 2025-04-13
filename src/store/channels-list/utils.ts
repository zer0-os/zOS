import { Channel, User } from './../channels/index';
import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import { MatrixClient } from 'matrix-js-sdk/lib/client';
import { MatrixAdapter } from '../../lib/chat/matrix/matrix-adapter';
import matrixClientInstance from '../../lib/chat/matrix/matrix-client-instance';
import { EventType, IEvent } from 'matrix-js-sdk/lib/matrix';
import { MatrixConstants } from '../../lib/chat/matrix/types';

export function rawUserToDomainUser(u): User {
  return {
    userId: u.id,
    matrixId: u.matrixId,
    profileId: u.profileId,
    isOnline: false,
    firstName: u.profileSummary?.firstName,
    lastName: u.profileSummary?.lastName,
    profileImage: u.profileSummary?.profileImage,
    lastSeenAt: u.lastActiveAt,
    primaryZID: u.primaryZID,
    primaryWallet: u.primaryWallet,
    wallets: u.wallets,
  };
}
