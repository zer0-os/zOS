import React, { useRef, useCallback, useEffect } from 'react';
import styles from './styles.module.scss';

export enum Tab {
  Gated = 'gated',
  Explore = 'explore',
  Channels = 'channels',
}

export interface TabData {
  id: Tab;
  label: string;
  unreadCount?: number;
  ariaLabel: string;
}

export interface TabListProps {
  selectedTab: Tab;
  onTabSelect: (tab: Tab) => void;
  tabsData: TabData[];
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
          {tab.label}
          {!!tab.unreadCount && (
            <div className={styles.TabBadge}>
              <span>{tab.unreadCount > 99 ? '99+' : tab.unreadCount}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
