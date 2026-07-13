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

type WindowOpenRule = Parameters<typeof webContents.setWindowOpenRules>[0]['rules'][number];

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

// Build a regex matching any subdomain of a URL's registrable (root) domain,
// over http or https. Used to keep the app's own family of hosts (app, api, …)
// opening in-app, the way ToDesktop's default does.
const sameRootDomainPattern = (rawUrl: string): string | undefined => {
  try {
    const labels = new URL(rawUrl).hostname.split('.');
    if (labels.length < 2) {
      return undefined;
    }
    const root = escapeRegExp(labels.slice(-2).join('.'));
    return `https?://(?:[a-z0-9-]+\\.)*${root}`;
  } catch {
    return undefined;
  }
};

// ToDesktop's default new-window handling is domain-aware: same-domain URLs open
// in a new in-app window, external URLs open in the system browser. Calling
// setWindowOpenRules REPLACES that default entirely, so we must re-express it —
// otherwise any window.open that doesn't match a rule (external chat links,
// block-explorer links, the OAuth popup, attachment downloads) is left with no
// handler and silently does nothing.
//
// Rules are evaluated in order (first match wins); `fallback` handles anything
// unmatched:
//   1. Explorer family -> system browser. Its claim flow needs a real browser
//      wallet extension that an in-app window lacks. Must precede the
//      same-domain rule below, since the explorer is itself same-domain.
//   2. about:blank      -> in-app. The attachment download opens a blank window
//      and then navigates it, so it must keep the in-app window handle.
//   3. App's own domain -> in-app. Preserves same-domain popups such as the
//      OAuth link flow, which postMessages back to window.opener.
//   fallback (external) -> system browser. Restores the default for chat links,
//      block-explorer links, arweave, etc.
const registerWindowOpenRules = async () => {
  const rules: WindowOpenRule[] = [];

  const explorerPattern = config.znsExplorerUrl ? explorerUrlPattern(config.znsExplorerUrl) : undefined;
  if (explorerPattern) {
    rules.push({ regex: explorerPattern, options: { action: 'openInBrowser' } });
  }

  rules.push({ regex: '^about:blank', options: { action: 'allow' } });

  const seen = new Set<string>();
  for (const source of [config.ZERO_API_URL, window.location.origin]) {
    const pattern = source ? sameRootDomainPattern(source) : undefined;
    if (pattern && !seen.has(pattern)) {
      seen.add(pattern);
      rules.push({ regex: pattern, options: { action: 'allow' } });
    }
  }

  try {
    const ref = await nativeWindow.getWebContents();
    await webContents.setWindowOpenRules({
      ref,
      rules,
      fallback: { action: 'openInBrowser' },
    });
  } catch (error) {
    console.error('Failed to set window-open rules', error);
  }
};

export const desktopInit = () => {
  if (!isDesktopApp()) {
    return;
  }
  console.log('Desktop version:', app.getVersion());
  console.log('Electron version:', platform.electron.getElectronVersion());

  webContents.on('context-menu', handleContextMenu);
  void registerWindowOpenRules();
};
