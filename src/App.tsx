import './main.scss';

import { useSelector } from 'react-redux';
import { AppRouter } from './apps/app-router';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { RootState } from './store';
import classNames from 'classnames';
import { getMainBackgroundClass, getMainBackgroundVideoSrc } from './utils';
import { AppBar } from './components/app-bar';
import { DialogManager } from './components/dialog-manager/container';
import { ThemeEngine } from './components/theme-engine';

export const App = () => {
  const { isAuthenticated, mainClassName, videoBackgroundSrc } = useAppMain();

  return (
    // See: ZOS-115
    // @ts-ignore
    <ZUIProvider>
      <div className={mainClassName}>
        {isAuthenticated && (
          <>
            {videoBackgroundSrc && <VideoBackground src={videoBackgroundSrc} />}
            <DialogManager />
            <AppBar />
            <AppRouter />
          </>
        )}
        <ThemeEngine />
      </div>
    </ZUIProvider>
  );
};

const useAppMain = () => {
  const { isAuthenticated, background } = useSelector((state: RootState) => ({
    isAuthenticated: !!state.authentication.user?.data,
    background: state.background.selectedMainBackground,
  }));

  const mainClassName = classNames('main', 'messenger-full-screen', getMainBackgroundClass(background), {
    'sidekick-panel-open': isAuthenticated,
    background: isAuthenticated,
  });

  const videoBackgroundSrc = getMainBackgroundVideoSrc(background);

  return {
    isAuthenticated,
    mainClassName,
    videoBackgroundSrc,
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
