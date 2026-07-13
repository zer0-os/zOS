import { isDesktopApp } from '@todesktop/client-core/platform/todesktop';
import { webContents, menu, platform, app, nativeWindow } from '@todesktop/client-core';

import { config } from '../config';

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

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build a regex matching the explorer on any subdomain of its root domain. The
// embedded explorer (config.znsExplorerUrl, e.g. explorer.zos.zero.tech) and
// the public one the claim flow links out to (e.g. explorer.zero.tech) share a
// root but differ by subdomain, so we match the whole family rather than one
// exact host.
const explorerUrlPattern = (rawUrl: string): string | undefined => {
  try {
    const labels = new URL(rawUrl).hostname.split('.');
    if (labels.length < 2) {
      return undefined;
    }
    const firstLabel = escapeRegExp(labels[0]);
    const root = escapeRegExp(labels.slice(-2).join('.'));
    return `https://${firstLabel}\\.(?:[a-z0-9-]+\\.)*${root}`;
  } catch {
    return undefined;
  }
};

// ToDesktop treats same-domain URLs as internal and opens them in a new in-app
// window. The ZNS explorer is on the same domain, so its "open in browser"
// links (e.g. the domain-claim flow) would open in-app — where the user has no
// browser wallet extension. Route the explorer's URLs to the system browser
// instead. Other links keep ToDesktop's default handling (no fallback rule).
const openExplorerInSystemBrowser = async () => {
  if (!config.znsExplorerUrl) {
    return;
  }
  const pattern = explorerUrlPattern(config.znsExplorerUrl);
  if (!pattern) {
    return;
  }
  try {
    const ref = await nativeWindow.getWebContents();
    await webContents.setWindowOpenRules({
      ref,
      rules: [{ regex: pattern, options: { action: 'openInBrowser' } }],
    });
  } catch (error) {
    console.error('Failed to set explorer window-open rule', error);
  }
};

export const desktopInit = () => {
  if (!isDesktopApp()) {
    return;
  }
  console.log('Desktop version:', app.getVersion());
  console.log('Electron version:', platform.electron.getElectronVersion());

  webContents.on('context-menu', handleContextMenu);
  void openExplorerInSystemBrowser();
};
