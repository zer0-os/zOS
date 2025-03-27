import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('message');

interface ReactionsProps {
  reactions: Record<string, number>;
}

export const Reactions = ({ reactions }: ReactionsProps) => {
  return (
    <div {...cn('reactions')}>
      {Object.entries(reactions).map(([key, value]) => (
        <div key={key} {...cn('reaction-icon')}>
          {key} <span>{value}</span>
        </div>
      ))}
    </div>
  );
};
