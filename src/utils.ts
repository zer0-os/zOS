interface ElectronWindow extends Window {
  isElectron: boolean;
}

declare let window: ElectronWindow;

export const isElectron = (): boolean => window?.isElectron;
