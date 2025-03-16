import { createContext, ReactNode, useContext } from 'react';
import { Panel } from '../../../store/panels/constants';
import { usePanelState } from '../../../store/panels/hooks';

type PanelContextType = {
  panel: Panel;
};

const PanelContext = createContext<PanelContextType | undefined>(undefined);

export const PanelProvider = ({ children, panel }: { children: ReactNode; panel: Panel }) => {
  return <PanelContext.Provider value={{ panel }}>{children}</PanelContext.Provider>;
};

export const usePanel = (): ReturnType<typeof usePanelState> => {
  const context = useContext(PanelContext);

  if (!context) {
    throw new Error('usePanel must be used within a PanelProvider');
  }

  return usePanelState(context.panel);
};
