import { SidekickTabs } from './../../components/sidekick/types';

export interface AppLayout {
  hasContextPanel: boolean;
  isContextPanelOpen: boolean;
  isSidekickOpen: boolean;
  activeSidekickTab: SidekickTabs;
}

export interface LayoutState {
  value: AppLayout;
}

export interface UpdateSidekickPayload {
  isOpen: boolean;
}

export interface SetActiveSidekickTabPayload {
  activeTab: SidekickTabs;
}
