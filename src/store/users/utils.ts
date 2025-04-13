import { User } from '../channels';

/**
 * We strip down the user objects that we store in state when they come from `receive` methods throughout sagas.
 * This is so that we can control the updates to users through a separate flow. The flow is as follows:
 *
 * Channel is received, users are stripped down to ids, channel is normalized and user gets saved as { userId: string, matrixId: string }
 * In a separate flow, we get all users from the store that are simplified, fetch them from the api, then update the store with the full user object.
 *
 * This way we can ensure user data comes from where we want it and not random places where we're constructing channel objects.
 *
 * Channel received with full user objects:
 * {
 *   id: "channel1",
 *   otherMembers: [
 *     { userId: "u1", matrixId: "@alice:matrix.org", name: "Alice", avatar: "..." },
 *     { userId: "u2", matrixId: "@bob:matrix.org", name: "Bob", avatar: "..." }
 *   ]
 * }
 *                     ↓
 * Strip users to IDs only:
 * {
 *   id: "channel1",
 *   otherMembers: [
 *     { userId: "u1", matrixId: "@alice:matrix.org" },
 *     { userId: "u2", matrixId: "@bob:matrix.org" }
 *   ]
 * }
 *                     ↓
 * Normalize & store basic user data:
 * users: {
 *   "u1": { userId: "u1", matrixId: "@alice:matrix.org" },
 *   "u2": { userId: "u2", matrixId: "@bob:matrix.org" }
 * }
 *                     ↓
 * Separate flow fetches full user data:
 * users: {
 *   "u1": { userId: "u1", matrixId: "@alice:matrix.org", name: "Alice", avatar: "...", ... },
 *   "u2": { userId: "u2", matrixId: "@bob:matrix.org", name: "Bob", avatar: "...", ... }
 * }
 */

/**
 * Store a user in the store as a simple object with the userId
 * This is used when storing denormalized data in the store so that we can control updates to users
 * @param user
 * @returns { userId: string, matrixId: string }
 */
export const toSimplifiedUser = (user: User) => ({ userId: user.userId, matrixId: user.matrixId });

/**
 * Store an array of users in the store as simple objects with the userId
 * This is used when storing denormalized data in the store so that we can control updates to users
 * @param users
 * @returns { userId: string, matrixId: string }[]
 */
export const toSimplifiedUsers = (users: User[]) => users.map(toSimplifiedUser);
