import { EventType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';

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

export async function getFilteredMembersForAutoComplete(
  roomMembers: { [userId: string]: { avatar_url?: string; display_name?: string } },
  filter: string
) {
  const normalizedFilter = filter.toLowerCase(); // Case-insensitive search

  const filteredResults = [];
  for (let matrixId of Object.keys(roomMembers)) {
    let displayName = roomMembers[matrixId]['display_name'] || matrixId.match(/@([^:]+)/)[1] || '';
    if (displayName.includes(normalizedFilter)) {
      filteredResults.push({
        matrixId,
        // should we prioritize the display_name, avatar_url from matrix OR our own db?
        displayName,
        avatar_url: roomMembers[matrixId]['avatar_url'] || '', // this will likely be '' for now
      });
    }
  }

  return filteredResults;
}
