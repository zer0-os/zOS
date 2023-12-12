export interface AppLayout {
  hasContextPanel: boolean;
  isContextPanelOpen: boolean;
  isMessengerFullScreen: boolean;
}

export interface LayoutState {
  value: AppLayout;
}
