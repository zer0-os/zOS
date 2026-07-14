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

// Build a regex matching one exact host (optionally with its port), over http or
// https. We deliberately match the exact host rather than the registrable
// domain: the explorer (explorer.zero.tech) shares a registrable domain with
// the app and API, so a domain-wide rule would also capture the explorer and
// keep it in-app — the opposite of what we want.
const exactHostPattern = (rawUrl: string): string | undefined => {
  try {
    const { host } = new URL(rawUrl);
    if (!host) {
      return undefined;
    }
    // Anchor on a host boundary so e.g. `zero.tech` doesn't match `zero.tech.evil.com`.
    return `^https?://${escapeRegExp(host)}(?:[:/?#]|$)`;
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
// Only the specific things that genuinely need an in-app window get an `allow`
// rule; everything else (the explorer, external chat/block-explorer/arweave
// links, …) falls through to the `openInBrowser` fallback and opens in the
// system browser:
//   - Explorer family -> system browser (explicit rule + fallback). Its claim
//     flow needs a real browser wallet extension an in-app window lacks.
//   - about:blank     -> in-app. The attachment download opens a blank window
//     and then navigates it, so it must keep the in-app window handle.
//   - API host        -> in-app. The OAuth link popup opens the API host and
//     postMessages back to window.opener, which only works in-app.
//   - App's own host  -> in-app. Preserves genuinely same-origin popups.
// The allow rules match EXACT hosts, not the registrable domain, so the
// explorer's same-root-domain URL is never captured by them.
const registerWindowOpenRules = async () => {
  const rules: WindowOpenRule[] = [];

  const explorerPattern = config.znsExplorerUrl ? explorerUrlPattern(config.znsExplorerUrl) : undefined;
  if (explorerPattern) {
    rules.push({ regex: explorerPattern, options: { action: 'openInBrowser' } });
  }

  rules.push({ regex: '^about:blank', options: { action: 'allow' } });

  const seen = new Set<string>();
  for (const source of [config.ZERO_API_URL, window.location.origin]) {
    const pattern = source ? exactHostPattern(source) : undefined;
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
