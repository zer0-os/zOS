import { IconProps } from '@zero-tech/zui/components/Icons/Icons.types';
import { Link } from 'react-router-dom';
import styles from './extraIconButton.module.scss';
import Tooltip from '../../tooltip';

interface AppLinkProps {
  Icon: React.JSXElementConstructor<IconProps>;
  isActive: boolean;
  label?: string;
  to: string;
  onLinkClick?: () => void;
}

const ExtraIconButton = ({ Icon, isActive, to, label, onLinkClick }: AppLinkProps) => {
  const handleClick = () => {
    if (!isActive && onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <Tooltip placement='right' overlay={label}>
      <Link title={label} className={styles.ExtraIconButton} to={!isActive ? to : '#'} onClick={handleClick}>
        <Icon size={22} />
      </Link>
    </Tooltip>
  );
};

export default ExtraIconButton;
