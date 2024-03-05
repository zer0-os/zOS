import * as React from 'react';

import { Accordion } from '@zero-tech/zui/components';
import { IconArrowLeft } from '@zero-tech/zui/icons';
import { bemClassName } from '../../../lib/bem';
import { config } from '../../../config';

import '../styles.scss';

const cn = bemClassName('secure-backup');

export interface Properties {
  onBack: () => void;
}

export class BackupFAQ extends React.Component<Properties> {
  back = (): void => {
    this.props.onBack();
  };

  get backupFAQContent() {
    return [
      {
        content:
          'ZERO Messenger is both end-to-end encrypted and decentralized. We champion privacy and sovereignty. As a result, some messages may be hidden from you. This is usually because you did not receive permission to decrypt them while logged out or inactive. If your entire conversation history is hidden, try restoring your account backup.',
        title: 'Why are some messages hidden?',
      },
      {
        content: (
          <>
            <div>
              To protect your privacy, new logins to ZERO Messenger do not have permission to decrypt and read your
              message history. To give yourself permission to do so — and allow you to import your account to new
              devices — Messenger allows you to create an account backup phrase.
            </div>
            <br />
            <div>
              Logging into your account and entering your backup phrase in Settings allows you to decrypt your
              conversation history on any new login.You should aways backup your account; once backed up, your backup
              phrase will not change.
            </div>
            <img {...cn('image')} src={`${config.imageAssetsPath}/Backup-Infographic.png`} alt='Backup Infographic' />
          </>
        ),
        title: 'What does a backup do?',
      },
      {
        title: 'A new login is asking me to verify with my account backup, what does this mean?',
        content: (
          <>
            <div>
              If you have have generated and saved your account backup phrase, you will be able to grant permission to
              decrypt historical messages on a new device or login for your account by verifying your backup phrase —
              i.e., entering it in Settings. Restoring your backup will allow the new login session to decrypt and read
              messages you received on another device or login.
            </div>
            <br />
            <div>
              If you do not verify your account with your backup every time you log into a new session or device, you
              will not be able to decrypt or read historical messages.What’s more, if you do not verify your new session
              with your account’s backup, then any currently viewable messages will NOT be decryptable in the future, in
              the event you log out of your current device, or log in to your account on a new device.
            </div>
          </>
        ),
      },
      {
        title: "I restored my backup. Why can't I read my messages?",
        content: (
          <>
            <div>
              As a result of being both decentralized and end-to-end encrypted, there are occasionally situations where
              restoring your backup won’t give you permission to read every message in your conversations. This is
              because ZERO Messenger utilizes ratchet (rotating) keys to encrypt and decrypt every user’s message. This
              means that Bob’s public key today is not the same as Bob’s public key two days ago. If you didn’t receive
              Bob’s public key two days ago, you won’t be able to decrypt his messages from two days ago with today’s
              key.
            </div>
            <br />
            <div>
              There are several reasons you might not receive another user’s public key:
              <ul>
                <li>You were inactive for more than a few days on all devices</li>
                <li>You were logged out on all devices</li>
                <li>You had not verified your backup on any device before starting a new session</li>
                <li>You cleared your browser cache and did not verify your backup afterwards</li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: 'How can I avoid encountering hidden messages?',
        content: (
          <>
            <div>
              There are a couple things you can do in ZERO Messenger to ensure you can read and decrypt messages:
            </div>
            <ul>
              <li>Every time you log in, on any device, verify with your backup phrase</li>
              <li>Do not log out of all devices simultaneously</li>
              <li>
                Only clear your cache when absolutely necessary, and restore your account backup immediately after
              </li>
            </ul>
          </>
        ),
      },
    ];
  }

  render() {
    return (
      <div {...cn('animation-container')}>
        <div {...cn('back')} onClick={this.back}>
          <IconArrowLeft size={16} /> Backup
        </div>

        <Accordion contrast='low' items={this.backupFAQContent} />
      </div>
    );
  }
}
