import React, { useRef, useCallback, useEffect } from 'react';
import styles from './styles.module.scss';

export enum Tab {
  Chains = 'chains',
}

export interface TabData {
  id: Tab;
  label: string;
  ariaLabel: string;
}

export interface TabListProps {
  selectedTab: Tab;
  tabsData: TabData[];

  onTabSelect: (tab: Tab) => void;
}

export const TabList: React.FC<TabListProps> = ({ selectedTab, onTabSelect, tabsData }) => {
  const tabListRef = useRef<HTMLDivElement>(null);

  const horizontalScroll = useCallback((event: WheelEvent) => {
    if (tabListRef.current && event.deltaY !== 0) {
      event.preventDefault();
      tabListRef.current.scrollLeft += event.deltaY;
    }
  }, []);

  useEffect(() => {
    const currentTabListRef = tabListRef.current;
    if (currentTabListRef) {
      currentTabListRef.addEventListener('wheel', horizontalScroll, { passive: false });
      return () => {
        currentTabListRef.removeEventListener('wheel', horizontalScroll);
      };
    }
  }, [horizontalScroll]);

  return (
    <div className={styles.TabList} ref={tabListRef}>
      {tabsData.map((tab) => (
        <div
          key={tab.id}
          className={`${styles.Tab} ${selectedTab === tab.id ? styles.TabActive : ''}`}
          onClick={() => onTabSelect(tab.id)}
          aria-label={tab.ariaLabel}
          role='tab'
          aria-selected={selectedTab === tab.id}
        >
          <span>{tab.label}</span>
        </div>
      ))}
    </div>
  );
};
