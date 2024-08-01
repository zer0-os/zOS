import { useRouteMatch } from 'react-router-dom';
import { AppBar as AppBarComponent } from './';

export const AppBar = () => {
  const match = useRouteMatch('/:app');

  return <AppBarComponent activeApp={match?.params?.app ?? ''} />;
};
