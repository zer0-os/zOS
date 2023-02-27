import { SidekickTabs } from '../../components/sidekick/types';
import { DEFAULT_ACTIVE_TAB } from './constants';

export function resolveActiveTab(key: string) {
  const activeTab = localStorage.getItem(key) as SidekickTabs;

  if (Object.values(SidekickTabs).includes(activeTab)) {
    return activeTab;
  }

  return DEFAULT_ACTIVE_TAB;
}
