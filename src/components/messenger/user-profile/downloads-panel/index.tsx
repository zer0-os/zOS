import * as React from 'react';

import { config } from '../../../../config';
import { bemClassName } from '../../../../lib/bem';

import { PanelHeader } from '../../list/panel-header';
import { IconLaptop1, IconPhone } from '@zero-tech/zui/icons';
import { ScrollbarContainer } from '../../../scrollbar-container';

import './styles.scss';

const cn = bemClassName('downloads-panel');

const desktopLinks = [
  { href: config.webAppDownloadPath, label: 'Mac' },
  { href: config.webAppDownloadPath, label: 'Windows' },
  { href: config.webAppDownloadPath, label: 'Linux' },
];

const mobileLinks = [
  { href: config.appleAppStorePath, label: 'iOS' },
  { href: config.googlePlayStorePath, label: 'Android' },
];

export interface Properties {
  onClose: () => void;
}

export class DownloadsPanel extends React.Component<Properties> {
  back = () => {
    this.props.onClose();
  };

  renderDownloadLinks(links: { href: string; label: string }[], isDirectDownload?: boolean) {
    return (
      <div {...cn('items-container')}>
        {links.map(({ href, label }) => (
          <a
            key={label}
            {...cn('link')}
            href={href}
            {...(!isDirectDownload && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {label}
          </a>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Download'} onBack={this.back} />
        </div>

        <ScrollbarContainer variant='on-hover'>
          <div {...cn('body')}>
            <div>
              <div {...cn('section-header')}>
                <IconLaptop1 {...cn('section-icon')} size={24} />
                <h4 {...cn('section-title')}>Desktop</h4>
              </div>
              {this.renderDownloadLinks(desktopLinks, true)}
            </div>

            <div>
              <div {...cn('section-header')}>
                <IconPhone {...cn('section-icon')} size={24} />
                <h4 {...cn('section-title')}>Mobile</h4>
              </div>
              {this.renderDownloadLinks(mobileLinks)}
            </div>
          </div>
        </ScrollbarContainer>
      </div>
    );
  }
}
