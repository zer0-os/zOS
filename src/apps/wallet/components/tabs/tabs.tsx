import { MouseEvent, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';
import { featureFlags } from '../../../../lib/feature-flags';
import styles from './tabs.module.scss';

const baseSteps = [
  { id: '0', title: 'Tokens', path: '/wallet' },
  { id: '1', title: 'NFTs', path: '/wallet/nfts' },
  { id: '4', title: 'Transactions', path: '/wallet/transactions' },
];

const stakingStep = { id: '3', title: 'Staking', path: '/wallet/staking' };

// Using ID to sort here, as Staking is conditional but needs to be third in the list
const unsortedSteps = featureFlags.enableStaking ? [...baseSteps, stakingStep] : baseSteps;
const steps = unsortedSteps.sort((a, b) => a.id.localeCompare(b.id));

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
