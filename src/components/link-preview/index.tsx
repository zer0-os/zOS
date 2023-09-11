import React from 'react';

import classNames from 'classnames';
import { BackgroundImage, BackgroundImageProperties } from '@zer0-os/zos-component-library';
import { LinkPreviewType } from '../../lib/link-preview';
import { getProvider } from '../../lib/cloudinary/provider';
import { IconButton } from '@zero-tech/zui/components';
import { IconLink1, IconXClose } from '@zero-tech/zui/icons';
import { bemClassName } from '../../lib/bem';

require('./styles.scss');
const cn = bemClassName('link-preview');

export interface Properties {
  type: LinkPreviewType;
  url: string;
  title: string;
  description: string;
  providerName?: string;
  authorName?: string;
  authorUrl?: string;
  html?: string;
  width?: number;
  thumbnail?: { url: string; width: number; height: number };
  className?: string;

  allowRemove?: boolean;
  onRemove?: () => void;
}

let twitterLogo;
function getTwitterLogo() {
  if (!twitterLogo) {
    twitterLogo = getProvider().getSource({ src: 'twitter-logo.png', local: false, options: {} });
  }
  return twitterLogo;
}

export class LinkPreview extends React.Component<Properties> {
  get width() {
    return this.props.thumbnail?.width || 40;
  }

  get titleUrl() {
    const { url, authorUrl, providerName } = this.props;

    if (providerName === 'Twitter' && authorUrl) {
      return authorUrl;
    }

    return url;
  }

  get title() {
    const { providerName, authorName, authorUrl, title } = this.props;

    if (providerName === 'Twitter' && authorName) {
      return this.generateUserContentTitle(authorName, authorUrl);
    }

    return <span className='link-preview__title-text'>{title}</span>;
  }

  generateUserContentTitle(name: string, url: string) {
    const userName = <span className='link-preview__author-name'>{name}</span>;
    const handle = this.extractHandleFromUrl(url);
    let userHandle: any = null;

    if (handle) {
      userHandle = <span className='link-preview__author-handle'>{handle}</span>;
    }

    return (
      <>
        {userName}
        {userHandle}
      </>
    );
  }

  extractHandleFromUrl(url: string) {
    const regex = new RegExp('twitter.com/(.*)$');

    if (regex.test(url)) {
      return `@${url.match(regex)[1]}`;
    }

    return null;
  }

  handleOnClick = () => {
    return window.open(this.props.url, '_blank');
  };

  renderBanner() {
    const { thumbnail, providerName } = this.props;

    if (!thumbnail || !this.width) return null;

    let source = thumbnail.url;
    const options: any = {
      width: 200,
      crop: 'fill',
    };

    if (providerName === 'Twitter') {
      options.background = 'transparent';
      source = getTwitterLogo();
    }

    const props: BackgroundImageProperties = {
      source,
      options,
      className: 'link-preview__banner-image',
      provider: getProvider(),
      autoHeight: true,
    };

    return (
      <div className='link-preview__banner'>
        <div {...cn('default-image')}>
          <IconLink1 size={24} />
        </div>
        <BackgroundImage {...props} />
      </div>
    );
  }

  render() {
    const { className } = this.props;

    return (
      <div className={classNames('link-preview', className)} onClick={this.handleOnClick}>
        {this.renderBanner()}
        <div {...cn('body')}>
          <div {...cn('title')}>{this.title}</div>
          <div {...cn('url')}>{this.titleUrl}</div>
        </div>
        {this.props.allowRemove && <IconButton size={24} Icon={IconXClose} onClick={this.props.onRemove} />}
      </div>
    );
  }
}
