import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Input } from '@zero-tech/zui/components/Input/Input';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { IconButton } from '@zero-tech/zui/components';
import { IconSearchMd, IconCoinsStacked2, IconPlus } from '@zero-tech/zui/icons';
import {
  ContentPortal as SidekickContentPortal,
  Content as SidekickContent,
  Scroll as SidekickScroll,
} from '../../../../components/sidekick';
import { TabList, Tab, TabData } from '../tab-list';
import { ChainItem } from '../chain-item';
import { setLastActiveTokenChain } from '../../../../lib/last-token-chain';

import styles from './styles.module.scss';

// Mock chain data - matching the chains we have mock token data for
const mockChains = [
  { id: 'ethereum', name: 'Ethereum', icon: 'ethereum' },
  { id: 'polygon', name: 'Polygon', icon: 'polygon' },
  { id: 'solana', name: 'Solana', icon: 'solana' },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'arbitrum' },
  { id: 'optimism', name: 'Optimism', icon: 'optimism' },
];

const tabsData: TabData[] = [
  {
    id: Tab.Chains,
    label: 'Chains',
    ariaLabel: 'Chains tab',
  },
];

export const Sidekick = () => {
  const history = useHistory();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.Chains);
  const [search, setSearch] = useState('');

  const handleLaunchToken = () => {
    console.log('Launch Token clicked');
  };

  // Extract current chain from URL
  const getCurrentChain = (): string | null => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length >= 3 && pathParts[1] === 'token' && pathParts[2]) {
      return pathParts[2];
    }
    return null;
  };

  const handleTabSelect = (tab: Tab) => {
    setSelectedTab(tab);
  };

  const handleChainSelect = (chainId: string) => {
    setLastActiveTokenChain(chainId);
    history.push(`/token/${chainId}`);
  };

  const renderChainItems = () => {
    const filteredChains = mockChains.filter((chain) => chain.name.toLowerCase().includes(search.toLowerCase()));
    const currentChain = getCurrentChain();

    return filteredChains.map((chain) => (
      <ChainItem
        key={chain.id}
        chainId={chain.id}
        chainName={chain.name}
        chainIcon={chain.icon}
        isSelected={currentChain === chain.id}
        onSelect={handleChainSelect}
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
          <IconButton Icon={IconPlus} onClick={handleLaunchToken} aria-label='Launch new token' />
        </div>

        <TabList selectedTab={selectedTab} onTabSelect={handleTabSelect} tabsData={tabsData} />

        <SidekickScroll>{renderContent()}</SidekickScroll>

        <div className={styles.LaunchButtonContainer}>
          <Button
            variant={ButtonVariant.Primary}
            onPress={handleLaunchToken}
            startEnhancer={<IconCoinsStacked2 size={16} />}
            className={styles.LaunchButton}
          >
            <div className={styles.LaunchButtonText}>Launch Token</div>
          </Button>
        </div>
      </SidekickContent>
    </SidekickContentPortal>
  );
};
