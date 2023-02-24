import { SidekickTabs } from '../../components/sidekick/types';
import { SIDEKICK_TAB_KEY, DEFAULT_ACTIVE_TAB } from './constants';

export function resolveActiveTab() {
  const activeTab = localStorage.getItem(SIDEKICK_TAB_KEY) as SidekickTabs;

  if (Object.values(SidekickTabs).includes(activeTab)) {
    return activeTab;
  }

  return DEFAULT_ACTIVE_TAB;
}
