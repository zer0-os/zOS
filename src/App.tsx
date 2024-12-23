import './main.scss';

import { useSelector } from 'react-redux';
import { AppRouter } from './apps/app-router';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { RootState } from './store';
import classNames from 'classnames';
import { getMainBackgroundClass, getMainBackgroundVideoSrc } from './utils';
import { AppBar } from './components/app-bar/container';
import { DialogManager } from './components/dialog-manager/container';
import { ThemeEngine } from './components/theme-engine';
import { denormalizeConversations } from './store/channels-list';
import { DefaultRoomLabels } from './store/channels';

export const App = () => {
  const {
    isAuthenticated,
    mainClassName,
    videoBackgroundSrc,
    wrapperClassName,
    hasUnreadNotifications,
    hasUnreadHighlights,
  } = useAppMain();

  return (
    // See: ZOS-115
    // @ts-ignore
    <ZUIProvider>
      <div className={mainClassName}>
        {isAuthenticated && (
          <>
            {videoBackgroundSrc && <VideoBackground src={videoBackgroundSrc} />}
            <div className={wrapperClassName}>
              <DialogManager />
              <AppBar hasUnreadNotifications={hasUnreadNotifications} hasUnreadHighlights={hasUnreadHighlights} />
              <AppRouter />
            </div>
          </>
        )}
        <ThemeEngine />
      </div>
    </ZUIProvider>
  );
};

const useAppMain = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.authentication.user?.data);
  const background = useSelector((state: RootState) => state.background.selectedMainBackground);

  const hasUnreadNotifications = useSelector((state: RootState) => {
    const conversations = denormalizeConversations(state);
    return conversations.some(
      (channel) =>
        channel.unreadCount?.total > 0 &&
        !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !channel.labels?.includes(DefaultRoomLabels.MUTE)
    );
  });

  const hasUnreadHighlights = useSelector((state: RootState) => {
    const conversations = denormalizeConversations(state);
    return conversations.some(
      (channel) =>
        channel.unreadCount?.highlight > 0 &&
        !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
        !channel.labels?.includes(DefaultRoomLabels.MUTE)
    );
  });

  const videoBackgroundSrc = getMainBackgroundVideoSrc(background);
  const mainClassName = classNames('main', 'messenger-full-screen', getMainBackgroundClass(background), {
    'sidekick-panel-open': isAuthenticated,
    background: isAuthenticated,
  });

  const wrapperClassName = 'app-main-wrapper';

  return {
    isAuthenticated,
    mainClassName,
    videoBackgroundSrc,
    wrapperClassName,
    hasUnreadNotifications,
    hasUnreadHighlights,
  };
};

const VideoBackground = ({ src }: { src: string }) => {
  return (
    <video data-testid='app-video-background' key={src} className='main-background-video' autoPlay loop muted>
      <source src={src} type='video/mp4' />
      Your browser does not support the video tag.
    </video>
  );
};
