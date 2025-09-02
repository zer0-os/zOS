import { useState } from 'react';

import { Input } from '@zero-tech/zui/components/Input/Input';
import { IconSearchMd } from '@zero-tech/zui/icons';
import {
  ContentPortal as SidekickContentPortal,
  Content as SidekickContent,
  Scroll as SidekickScroll,
} from '../../../../components/sidekick';
import { TabList, Tab, TabData } from './tab-list';

import styles from './styles.module.scss';

const tabsData: TabData[] = [
  {
    id: Tab.Chains,
    label: 'Chains',
    ariaLabel: 'Chains tab',
  },
];

export const Sidekick = () => {
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Chains);
  const [search, setSearch] = useState('');

  const handleTabSelect = (tab: Tab) => {
    setSelectedTab(tab);
  };

  const renderContent = () => {
    switch (selectedTab) {
      case Tab.Chains:
        return (
          <div className={styles.EmptyState}>
            <span>Chains coming soon</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidekickContentPortal>
      <SidekickContent>
        <div className={styles.Actions}>
          <Input
            className={styles.Search}
            onChange={setSearch}
            size={'small'}
            startEnhancer={<IconSearchMd size={16} color={'var(--color-greyscale-11)'} />}
            type={'search'}
            value={search}
            wrapperClassName={styles.SearchWrapper}
            placeholder='Search chains...'
          />
        </div>

        <TabList selectedTab={selectedTab} onTabSelect={handleTabSelect} tabsData={tabsData} />

        <SidekickScroll>{renderContent()}</SidekickScroll>
      </SidekickContent>
    </SidekickContentPortal>
  );
};
