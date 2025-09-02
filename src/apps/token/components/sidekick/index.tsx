import { useState } from 'react';

import { Input } from '@zero-tech/zui/components/Input/Input';
import { IconSearchMd } from '@zero-tech/zui/icons';
import {
  ContentPortal as SidekickContentPortal,
  Content as SidekickContent,
  Scroll as SidekickScroll,
} from '../../../../components/sidekick';
import { TabList, Tab, TabData } from '../tab-list';
import { ChainItem } from '../chain-item';

import styles from './styles.module.scss';

// Mock chain data
const mockChains = [
  { id: 'moonit', name: 'Moonit', icon: 'moonit', route: '/token/moonit' },
  { id: 'solana', name: 'Solana', icon: 'solana', route: '/token/solana' },
  { id: 'ethereum', name: 'Ethereum', icon: 'ethereum', route: '/token/ethereum' },
  { id: 'base', name: 'Base', icon: 'base', route: '/token/base' },
  { id: 'bsc', name: 'BSC', icon: 'bsc', route: '/token/bsc' },
  { id: 'pulsechain', name: 'PulseChain', icon: 'pulsechain', route: '/token/pulsechain' },
  { id: 'polygon', name: 'Polygon', icon: 'polygon', route: '/token/polygon' },
  { id: 'abstract', name: 'Abstract', icon: 'abstract', route: '/token/abstract' },
  { id: 'ton', name: 'TON', icon: 'ton', route: '/token/ton' },
];

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

  const renderChainItems = () => {
    const filteredChains = mockChains.filter((chain) => chain.name.toLowerCase().includes(search.toLowerCase()));

    return filteredChains.map((chain) => (
      <ChainItem
        key={chain.id}
        route={chain.route}
        chainId={chain.id}
        chainName={chain.name}
        chainIcon={chain.icon}
        isSelected={false}
      />
    ));
  };

  const renderContent = () => {
    switch (selectedTab) {
      case Tab.Chains:
        return <ul className={styles.List}>{renderChainItems()}</ul>;
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
