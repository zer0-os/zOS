import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';

import { Header } from '../header';
import { IconBell1 } from '@zero-tech/zui/icons';
import { NotificationItem } from './notification-item';

import styles from './styles.module.scss';

export interface PublicProperties {}

export interface Properties extends PublicProperties {}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(): Partial<Properties> {
    return {};
  }

  renderHeaderIcon() {
    return <IconBell1 className={styles.HeaderIcon} size={18} isFilled />;
  }

  renderHeaderTitle() {
    return <div className={styles.HeaderTitle}>Notifications</div>;
  }

  render() {
    const notifications = [
      { id: 1, content: 'Joe Bloggs mentioned you in OG Chat' },
      { id: 2, content: 'Jeffy B mentioned you in Billionaires Hide Out' },
      { id: 3, content: 'Elon M sent you a direct message' },
      { id: 4, content: 'Sarah K liked your post in Travel Lovers' },
      { id: 5, content: 'Mark Z commented on your photo in Tech Geeks' },
      { id: 6, content: 'Emily R sent you a friend request' },
      { id: 7, content: 'Alice W shared your post in Foodies United' },
      { id: 8, content: 'Bob T invited you to join Startup Founders' },
      { id: 9, content: 'John D mentioned you in Fitness Enthusiasts' },
      { id: 10, content: 'Kevin H tagged you in a photo' },
      { id: 11, content: 'Nina P sent you a direct message' },
      { id: 12, content: 'Oscar L liked your comment in Movie Buffs' },
      { id: 13, content: 'Lily G replied to your comment in Artists Hub' },
      { id: 14, content: 'David S mentioned you in Coding Ninjas' },
      { id: 15, content: 'Jessica M invited you to join Music Lovers' },
      { id: 16, content: 'Tom R sent you a direct message' },
      { id: 17, content: 'Rebecca C liked your post in Gardeners Club' },
      { id: 18, content: 'George K mentioned you in Bookworms Group' },
      { id: 19, content: 'Hannah F shared your post in Fashionistas' },
      { id: 20, content: 'Ian V commented on your video in Gamers United' },
    ];

    return (
      <div className={styles.NotificationsFeed}>
        <div>
          <div className={styles.HeaderContainer}>
            <Header title={this.renderHeaderTitle()} icon={this.renderHeaderIcon()} />
          </div>

          <div className={styles.Body}>
            <ol className={styles.Notifications}>
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem content={notification.content} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }
}

export const NotificationsFeed = connectContainer<PublicProperties>(Container);
