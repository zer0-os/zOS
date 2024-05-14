import { isDesktopApp } from '@todesktop/client-core/platform/todesktop';
import { webContents, menu, platform, app } from '@todesktop/client-core';

// Adapted from https://github.com/sindresorhus/electron-context-menu/
const handleContextMenu = async (ev: any) => {
  const { editFlags } = ev;
  const hasText = ev.selectionText.length > 0;
  const can = (type) => editFlags[`can${type}`] && hasText;

  const template = [
    {
      label: 'Cut',
      enabled: can('Cut'),
      visible: ev.isEditable,
      role: 'cut' as 'cut',
    },
    {
      label: 'Copy',
      enabled: can('Copy'),
      visible: ev.isEditable || hasText,
      role: 'copy' as 'copy',
    },
    {
      label: 'Paste',
      enabled: editFlags.canPaste,
      visible: ev.isEditable,
      role: 'paste' as 'paste',
    },
  ].filter((item) => item.visible);

  const menuRef = await menu.buildFromTemplate({
    template,
  });
  await menu.popup({ ref: menuRef });
};

export const desktopInit = () => {
  if (!isDesktopApp()) {
    return;
  }
  console.log('Desktop version:', app.getVersion());
  console.log('Electron version:', platform.electron.getElectronVersion());

  webContents.on('context-menu', handleContextMenu);
};
