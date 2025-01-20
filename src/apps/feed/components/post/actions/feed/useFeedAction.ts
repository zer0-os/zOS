import { useHistory } from 'react-router-dom';

export const useFeedAction = (channelZid: string) => {
  const history = useHistory();

  const handleOnClick = () => {
    if (history.location.pathname !== `/feed/${channelZid}`) {
      history.push(`/feed/${channelZid}`);
    }
  };

  return {
    handleOnClick,
  };
};
