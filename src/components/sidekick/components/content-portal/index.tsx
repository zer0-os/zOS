import { ReactNode, useLayoutEffect, useState } from 'react';
import { SIDEKICK_PORTAL_ID } from '../../lib/constants';
import { createPortal } from 'react-dom';

export interface ContentPortalProps {
  children: ReactNode;
}

export const ContentPortal = ({ children }: ContentPortalProps) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalElement(document.getElementById(SIDEKICK_PORTAL_ID));
  }, []);

  if (!portalElement) {
    return null;
  }

  return createPortal(children, portalElement);
};
