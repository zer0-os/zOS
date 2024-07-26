import './main.scss';

import { useSelector } from 'react-redux';
import { AppRouter } from './apps/app-router';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';
import { RootState } from './store';
import classNames from 'classnames';
import { getMainBackgroundClass } from './utils';
import { AppBar } from './components/app-bar';

export const App = () => {
  const { mainClassName } = useAppMain();

  return (
    // See: ZOS-115
    // @ts-ignore
    <ZUIProvider>
      <div className={mainClassName}>
        <AppBar />
        <AppRouter />
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

  return {
    mainClassName,
  };
};
