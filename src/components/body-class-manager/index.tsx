import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducer';

const BodyClassManager = () => {
  const isActiveConversationId = useSelector((state: RootState) => state.chat.activeConversationId);
  const isJoining = useSelector((state: RootState) => state.chat.isJoiningConversation);
  const isChatReady = useSelector((state: RootState) => state.chat.isChatConnectionComplete);
  const isLoggedIn = useSelector((state: RootState) => state.authentication.isLoggedIn);

  useEffect(() => {
    const className = 'logged-in';

    const shouldAddClass = isLoggedIn && (isJoining || (isActiveConversationId && isChatReady));

    if (shouldAddClass) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [
    isActiveConversationId,
    isJoining,
    isChatReady,
    isLoggedIn,
  ]);

  return null;
};

export default BodyClassManager;
