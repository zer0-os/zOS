import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/reducer';

const BodyClassManager = () => {
  const isJoining = useSelector((state: RootState) => state.chat.isJoiningConversation);
  const isChatReady = useSelector((state: RootState) => state.chat.isChatConnectionComplete);

  useEffect(() => {
    const className = 'logged-in';

    const shouldAddClass = isJoining || isChatReady;

    if (shouldAddClass) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      if (!shouldAddClass) {
        document.body.classList.remove(className);
      }
    };
  }, [isJoining, isChatReady]);

  return null;
};

export default BodyClassManager;
