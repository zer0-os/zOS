import { createBrowserHistory, createHashHistory } from 'history';
import { Message } from '../../store/messages';
import { isElectron } from '../../utils';
import { nativeWindow } from '@todesktop/client-core';

const DEFAULT_HEADING = 'Chat message received';

export const send = (options: { body; heading; tag }) => {
  const { body, heading, tag } = options;

  const notification = new Notification(heading, {
    // it appears on desktop (Windows) a long tag prevents the notification
    // from triggering so we disable it on Electron
    tag: !isElectron() ? tag : undefined,
    body,
    icon: '',
  });

  // add click event to show window on desktop
  if (isElectron()) {
    notification.onclick = (e) => {
      e.preventDefault();
      nativeWindow.show();
      notification.close();
    };
  }
};

export function mapMessage(message: Message) {
  return { heading: DEFAULT_HEADING, body: 'You have received a message', tag: message.id };
}

let theHistory = null;
export function getHistory() {
  theHistory = theHistory ?? createHistory();
  return theHistory;
}

function createHistory() {
  return isElectron() ? createHashHistory() : createBrowserHistory();
}

export function getNavigator() {
  return navigator;
}
