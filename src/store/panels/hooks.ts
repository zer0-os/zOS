import { useDispatch, useSelector } from 'react-redux';
import { togglePanel, setPanelState, openPanel, closePanel } from './index';
import { getPanelOpenState } from './selectors';
import { RootState } from '../reducer';
import { Panel } from './constants';

export const usePanelState = (panel: Panel) => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => getPanelOpenState(state, panel));

  return {
    isOpen,
    toggle: () => dispatch(togglePanel(panel)),
    open: () => dispatch(openPanel(panel)),
    close: () => dispatch(closePanel(panel)),
    setIsOpen: (isOpen: boolean) => dispatch(setPanelState({ panel, isOpen })),
  };
};
