import { useDispatch, useSelector } from 'react-redux';
import { togglePanel, setPanelState, openPanel, closePanel } from './index';
import { getPanelOpenState } from './selectors';
import { RootState } from '../reducer';
import { Panel } from './constants';

function panelStateSelector(panel: Panel | undefined) {
  return (state: RootState) => getPanelOpenState(state, panel);
}

export const usePanelState = (panel: Panel | undefined) => {
  const dispatch = useDispatch();
  const isOpen = !!useSelector(panelStateSelector(panel));

  return {
    panel,
    isOpen: !panel ? true : isOpen,
    toggle: () => (panel ? dispatch(togglePanel(panel)) : undefined),
    open: () => (panel ? dispatch(openPanel(panel)) : undefined),
    close: () => (panel ? dispatch(closePanel(panel)) : undefined),
    setIsOpen: (isOpen: boolean) => (panel ? dispatch(setPanelState({ panel, isOpen })) : undefined),
  };
};
