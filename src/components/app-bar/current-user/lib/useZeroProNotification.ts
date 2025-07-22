import { useDispatch, useSelector } from 'react-redux';
import { showZeroProNotificationSelector } from '../../../../store/user-profile/selectors';
import { closeZeroProNotification, openZeroPro } from '../../../../store/user-profile';
import { userZeroProSubscriptionSelector } from '../../../../store/authentication/selectors';

export const useZeroProNotification = () => {
  const dispatch = useDispatch();

  const isZeroProSubscriber = useSelector(userZeroProSubscriptionSelector);
  const showZeroProNotification = useSelector(showZeroProNotificationSelector);

  const handleUpgradeClick = () => {
    dispatch(openZeroPro());
    dispatch(closeZeroProNotification());
  };

  const handleCloseNotification = () => {
    dispatch(closeZeroProNotification());
  };

  return {
    isZeroProSubscriber,
    showZeroProNotification,
    onUpgradeClick: handleUpgradeClick,
    onCloseZeroProNotification: handleCloseNotification,
  };
};
