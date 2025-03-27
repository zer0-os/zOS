import { useState, MouseEvent } from 'react';

interface ContextMenuProps {
  onOpen: () => void;
}

interface ContextMenuReturn {
  position: {
    x: number;
    y: number;
  };
  handler: (event: MouseEvent) => void;
}

export const useContextMenu = ({ onOpen }: ContextMenuProps): ContextMenuReturn => {
  const [menuX, setMenuX] = useState(0);
  const [menuY, setMenuY] = useState(0);

  const handleContextMenu = (event: MouseEvent) => {
    if (typeof window !== 'undefined' && window.getSelection) {
      const selectedText = window.getSelection().toString();
      if (selectedText.length > 0) {
        return;
      }
    }

    if (event.button === 2) {
      event.preventDefault();
      event.stopPropagation();
      const { pageX, pageY } = event;
      onOpen();
      setMenuX(pageX);
      setMenuY(pageY);
    }
  };

  return {
    position: {
      x: menuX,
      y: menuY,
    },
    handler: handleContextMenu,
  };
};
