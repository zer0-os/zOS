import { MouseEvent, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';
import styles from './tabs.module.scss';

const steps = [
  { id: '0', title: 'Tokens', path: '/wallet' },
  { id: '1', title: 'NFTs', path: '/wallet/nfts' },
  { id: '2', title: 'Transactions', path: '/wallet/transactions' },
];

export const WalletTabs = () => {
  const location = useLocation();
  const [barLeft, setBarLeft] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  const handleTabClick = (e: MouseEvent<HTMLAnchorElement>) => {
    setBarLeft(e.currentTarget.offsetLeft);
    setBarWidth(e.currentTarget.offsetWidth);
  };

  const containerRef = useCallback(
    (node: HTMLDivElement) => {
      requestAnimationFrame(() => {
        if (node) {
          const activeTabIndex = steps.findIndex((step) => step.path === location.pathname);
          const activeTab = node.children[activeTabIndex] as HTMLElement;

          if (activeTab) {
            setBarLeft(activeTab.offsetLeft);
            setBarWidth(activeTab.offsetWidth);
          }
        }
      });
    },
    [location.pathname]
  );

  return (
    <div className={styles.walletTabs} ref={containerRef}>
      {steps.map((step) => (
        <Link
          key={step.id}
          to={step.path}
          className={cn(styles.tab, { [styles.active]: location.pathname === step.path })}
          onClick={handleTabClick}
        >
          <span>{step.title}</span>
        </Link>
      ))}
      <div className={styles.bar} style={{ left: `${barLeft}px`, width: `${barWidth}px` }} />
    </div>
  );
};
