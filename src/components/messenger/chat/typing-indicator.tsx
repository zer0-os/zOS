interface ChatTypingIndicatorProps {
  usersTyping: string[];
  className?: string;
}

export const ChatTypingIndicator = ({ usersTyping, className }: ChatTypingIndicatorProps) => {
  let text = null;

  if (usersTyping.length === 0) {
    text = null;
  } else if (usersTyping.length === 1) {
    text = (
      <>
        <b>{usersTyping[0]}</b> is typing...
      </>
    );
  } else if (usersTyping.length === 2) {
    text = (
      <>
        <b>{usersTyping[0]}</b> and <b>{usersTyping[1]}</b> are typing...
      </>
    );
  } else {
    text = (
      <>
        <b>{usersTyping[0]}</b> and <b>{usersTyping.length - 1}</b> others are typing...
      </>
    );
  }

  return <div className={className}>{text}</div>;
};
