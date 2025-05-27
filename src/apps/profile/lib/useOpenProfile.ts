import { useHistory } from 'react-router-dom';

export const useOpenProfile = () => {
  const history = useHistory();

  const onOpenProfile = (id: string) => {
    history.push(`/profile/${id}`);
  };

  return {
    onOpenProfile,
  };
};
