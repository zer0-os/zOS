import { useRouteMatch } from 'react-router-dom';
import { useProfile } from './useProfile';

export const useProfileApp = () => {
  const match = useRouteMatch('/profile/:id');
  const id = match?.params.id;

  return useProfile({ id });
};
