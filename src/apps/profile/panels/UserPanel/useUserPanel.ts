import { useProfileApp } from '../../lib/useProfileApp';

export const useUserPanel = () => {
  const { data, isLoading } = useProfileApp();

  const handle = data?.handle;
  const profileImageUrl = data?.profileImage;
  const zid = data?.primaryZid;

  return {
    handle,
    profileImageUrl,
    zid,
    isLoading,
  };
};
