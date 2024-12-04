import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';

export const AppBar = ({ hasUnreadNotifications }: { hasUnreadNotifications: boolean }) => {
  const match = useRouteMatch('/:app');

  return <AppBarComponent activeApp={match?.params?.app ?? ''} hasUnreadNotifications={hasUnreadNotifications} />;
};
