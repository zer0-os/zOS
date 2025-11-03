import { select, call, delay, spawn, take, race, cancel } from 'redux-saga/effects';
import type { Task } from 'redux-saga';
import { PresencePoller } from '../../lib/chat/presence-poller';
import { allChannelsSelector } from '../channels/selectors';
import { denormalize } from '../channels';
import { ConversationEvents, getConversationsBus } from '../channels-list/channels';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { featureFlags } from '../../lib/feature-flags';

const PRESENCE_POLL_INTERVAL_MS = 30 * 1000; // 30 seconds
const MAX_GROUP_SIZE_FOR_PRESENCE = 15;

// Keep reference to the running polling task so we can cancel it on logout
let pollingTask: Task | null = null;

export const isEligibleForPresence = (totalMembers: number): boolean =>
  totalMembers === 2 || totalMembers <= MAX_GROUP_SIZE_FOR_PRESENCE;

/**
 * Extracts matrix IDs from eligible channels (DMs or small groups <= 15 members).
 */
export function* getEligiblePresenceTargets(): Generator<any, string[], any> {
  const allChannels = yield select(allChannelsSelector);
  const state = yield select();
  const matrixIds = new Set<string>();

  for (const normalizedChannel of allChannels) {
    if (!isEligibleForPresence(normalizedChannel.totalMembers)) {
      continue;
    }

    const channel = denormalize(normalizedChannel.id, state);
    if (!channel?.otherMembers) {
      continue;
    }

    for (const member of channel.otherMembers) {
      if (member?.matrixId) {
        matrixIds.add(member.matrixId);
      }
    }
  }

  return Array.from(matrixIds);
}

/**
 * Updates presence targets and triggers a tick to fetch stale/new presence data.
 */
export function* updateAndPollPresence() {
  const matrixIds = yield call(getEligiblePresenceTargets);
  yield call(() => PresencePoller.setTargets(matrixIds));
  yield call(() => PresencePoller.tick());
}

/**
 * Polls presence every 30 seconds.
 * Checks for new members and fetches stale presence data.
 */
export function* syncPresencePolling() {
  while (true) {
    yield call(updateAndPollPresence);
    yield delay(PRESENCE_POLL_INTERVAL_MS);
  }
}

/**
 * Waits for conversations to be loaded, then starts presence polling.
 */
function* waitForConversationsLoaded() {
  const isConversationsLoaded = yield select((state) => state.chat.isConversationsLoaded);
  if (isConversationsLoaded) {
    return true;
  }

  const { conversationsLoaded } = yield race({
    conversationsLoaded: take(yield call(getConversationsBus), ConversationEvents.ConversationsLoaded),
    abort: take(yield call(getAuthChannel), AuthEvents.UserLogout),
  });

  return !!conversationsLoaded;
}

/**
 * Starts presence polling after conversations are loaded and members are available.
 */
export function* startPresencePollingAfterSetup() {
  if (!featureFlags.enablePresence) {
    return;
  }
  const conversationsLoaded = yield call(waitForConversationsLoaded);
  if (!conversationsLoaded) {
    return;
  }

  // Small delay to ensure members are populated from sliding sync
  yield delay(2000);

  yield call(updateAndPollPresence);

  // Start polling loop once; guard against double-spawns on fast re-login
  if (!pollingTask) {
    pollingTask = yield spawn(syncPresencePolling);
  }
}

/**
 * Immediately fetches presence for specific matrix IDs.
 * Used when new members are added to eligible channels.
 */
export function* fetchPresenceForNewMembers(matrixIds: string[]) {
  if (matrixIds.length === 0) {
    return;
  }
  yield call(() => PresencePoller.fetchForNewMembers(matrixIds));
}

/**
 * Stops presence polling. Called on logout.
 */
export function* stopPresencePolling() {
  if (pollingTask) {
    yield cancel(pollingTask);
    pollingTask = null;
  }

  yield call(() => PresencePoller.stop());
}
