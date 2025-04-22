import { useRouteMatch } from 'react-router-dom';
import { useProfile } from './useProfile';
import { featureFlags } from '../../../lib/feature-flags';

export const useProfileApp = () => {
  const match = useRouteMatch('/profile/:id');
  const id = match?.params.id;

  const isEnabled = featureFlags.enableUserProfiles;

  return useProfile({ id: isEnabled ? id : undefined });
};
