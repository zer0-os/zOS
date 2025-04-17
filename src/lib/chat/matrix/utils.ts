import { EventType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk/lib/matrix';
import { User as ChannelMember } from '../../../store/channels';
import isEqual from 'lodash.isequal';

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

export async function getFilteredMembersForAutoComplete(roomMembers: ChannelMember[] = [], filter: string = '') {
  const normalizedFilter = filter.toLowerCase(); // Case-insensitive search

  const filteredResults = [];
  for (const member of roomMembers) {
    let displayName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    if (displayName.includes(normalizedFilter)) {
      let id = extractUserIdFromMatrixId(member.userId || member.matrixId);
      filteredResults.push({
        id,
        displayName: `${member.firstName || ''} ${member.lastName || ''}`,
        profileImage: member.profileImage,
        displayHandle: member.displaySubHandle,
      });
    }
  }

  return filteredResults;
}

export function constructFallbackForParentMessage(parentMessage) {
  if (!parentMessage.message) return '';

  const fallback = parentMessage.message
    .split('\n')
    .map((line, index) => (index === 0 ? `> <${parentMessage.sender.matrixId}> ${line}` : `> ${line}`))
    .join('\n');

  return fallback;
}

export function parsePlainBody(body) {
  if (!body) return '';

  const parsedBody = body
    .split('\n')
    .filter((line) => !line.startsWith('> '))
    .join('\n')
    .trim();

  return parsedBody;
}

export const getObjectDiff = (obj1, obj2, compareRef = false) => {
  return Object.keys(obj1).reduce((result, key) => {
    if (!obj2.hasOwnProperty(key)) {
      result.push(key);
    } else if (isEqual(obj1[key], obj2[key])) {
      const resultKeyIndex = result.indexOf(key);

      if (compareRef && obj1[key] !== obj2[key]) {
        result[resultKeyIndex] = `${key} (ref)`;
      } else {
        result.splice(resultKeyIndex, 1);
      }
    }
    return result;
  }, Object.keys(obj2));
};

/**
 * Extracts the user ID from a Matrix ID
 * @param matrixId - The Matrix ID in format @uuid:server or plain uuid
 * @returns The extracted user ID (UUID)
 * @example
 * extractUserIdFromMatrixId('@50c6e12e-1fe2-43f9-8991-ab269696588f:homeserver.domain.com')
 * // Returns: '50c6e12e-1fe2-43f9-8991-ab269696588f'
 */
export function extractUserIdFromMatrixId(matrixId: string): string {
  if (!matrixId) return '';
  if (matrixId.startsWith('@')) {
    return matrixId.replace(/^@([^:]+).*$/, '$1');
  }
  return matrixId;
}

/**
 * Checks if a matrix ID is valid
 * @param matrixId - The Matrix ID in format @uuid:server
 * @returns True if the matrix ID is valid, false otherwise
 * @example
 * isMatrixId('@50c6e12e-1fe2-43f9-8991-ab269696588f:homeserver.domain.com')
 * // Returns: true
 * isMatrixId('50c6e12e-1fe2-43f9-8991-ab269696588f')
 * // Returns: false
 */
export function isMatrixId(matrixId: string): boolean {
  return /^@(.|-){36}:/.test(matrixId);
}

/**
 * Checks if a matrix ID is a valid admin matrix ID
 * @param matrixId - The Matrix ID in format @uuid:server
 * @returns Boolean
 */
export function isAdminMatrixId(matrixId: string): boolean {
  return matrixId === 'admin';
}

/**
 * Checks if a matrix ID is a valid telegram matrix ID
 * @param matrixId - The Matrix ID in format @telegram:server
 * @returns Boolean
 */
export function isTelegramMatrixId(matrixId: string): boolean {
  return matrixId.includes('telegram');
}
