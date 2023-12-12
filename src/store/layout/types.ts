export interface AppLayout {
  hasContextPanel: boolean;
  isContextPanelOpen: boolean;
  isSidekickOpen: boolean;
  isMessengerFullScreen: boolean;
}

export interface LayoutState {
  value: AppLayout;
}
