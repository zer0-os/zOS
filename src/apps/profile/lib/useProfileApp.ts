import { useRouteMatch } from 'react-router-dom';
import { useProfile } from './useProfile';
import { featureFlags } from '../../../lib/feature-flags';

export const useProfileApp = () => {
  const match = useRouteMatch('/profile/:id');
  const id = match?.params.id;
  console.log('XXXX Profile Match:', { match, id });

  const isEnabled = featureFlags.enableUserProfiles;
  console.log('XXXX Profile Feature Flag:', { isEnabled, id });

  return useProfile({ id: isEnabled ? id : undefined });
};
