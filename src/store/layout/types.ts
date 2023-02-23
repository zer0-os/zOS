export interface AppLayout {
  hasContextPanel: boolean;
  isContextPanelOpen: boolean;
  isSidekickOpen: boolean;
}

export interface LayoutState {
  value: AppLayout;
}

export interface UpdateSidekickPayload {
  isOpen: boolean;
}
