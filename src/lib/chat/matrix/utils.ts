import { EventType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';
import { User as ChannelMember } from '../../../store/channels';

// Copied from the matrix-react-sdk
export async function setAsDM(matrix: SDKMatrixClient, roomId: string, userId: string): Promise<void> {
  const mDirectEvent = matrix.getAccountData(EventType.Direct);
  const currentContent = mDirectEvent?.getContent() || {};

  const dmRoomMap = new Map(Object.entries(currentContent));
  let modified = false;

  // remove it from the lists of any others users
  // (it can only be a DM room for one person)
  for (const thisUserId of dmRoomMap.keys()) {
    const roomList = dmRoomMap.get(thisUserId) || [];

    if (thisUserId !== userId) {
      const indexOfRoom = roomList.indexOf(roomId);
      if (indexOfRoom > -1) {
        roomList.splice(indexOfRoom, 1);
        modified = true;
      }
    }
  }

  // now add it, if it's not already there
  if (userId) {
    const roomList = dmRoomMap.get(userId) || [];
    if (roomList.indexOf(roomId) === -1) {
      roomList.push(roomId);
      modified = true;
    }
    dmRoomMap.set(userId, roomList);
  }

  // prevent unnecessary calls to setAccountData
  if (!modified) return;

  await matrix.setAccountData(EventType.Direct, Object.fromEntries(dmRoomMap));
}

// TODO: follow up to use zOS user instead of matrix user
export async function getFilteredMembersForAutoComplete(roomMembers: ChannelMember[] = [], filter: string = '') {
  const normalizedFilter = filter.toLowerCase(); // Case-insensitive search

  const filteredResults = [];
  for (const member of roomMembers) {
    let displayName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    if (displayName.includes(normalizedFilter)) {
      filteredResults.push({
        id: member.userId || member.matrixId,
        displayName: `${member.firstName || ''} ${member.lastName || ''}`,
        profileImage: member.profileImage,
        primaryZID: member.primaryZID,
      });
    }
  }

  return filteredResults;
}
