import { createContext, ReactNode, useContext } from 'react';
import { Panel } from '../../../store/panels/constants';
import { usePanelState } from '../../../store/panels/hooks';

type PanelContextType = {
  panel: Panel;
  name?: string;
};

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export const PanelProvider = ({ children, panel, name }: { children: ReactNode; panel: Panel; name?: string }) => {
  return <PanelContext.Provider value={{ panel, name }}>{children}</PanelContext.Provider>;
};

export const usePanel = (): ReturnType<typeof usePanelState> & { name?: string } => {
  const context = useContext(PanelContext);

  if (!context) {
    throw new Error('usePanel must be used within a PanelProvider');
  }

  return { ...usePanelState(context.panel), name: context.name };
};
