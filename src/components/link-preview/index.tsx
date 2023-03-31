import React from 'react';

import classNames from 'classnames';
import { BackgroundImage, BackgroundImageProperties, VideoPlayer, ButtonLink } from '@zer0-os/zos-component-library';
import { LinkPreviewType } from '../../lib/link-preview';
import { provider as cloudinaryProvider } from '../../lib/cloudinary/provider';

require('./styles.scss');

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
}

interface State {
  width: number;
}

const TWITTER_LOGO = cloudinaryProvider.getSource({ src: 'twitter-logo.png', local: false, options: {} });

export class LinkPreview extends React.Component<Properties, State> {
  state = { width: 0 };
  ref = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.ref.current && !this.props.width) {
      const { width } = this.ref.current.getBoundingClientRect();

      this.setState({ width: Math.round(width) });
    }
  }

  get width() {
    return this.props.width || this.state.width;
  }

  get bannerRatio() {
    const {
      thumbnail: { width, height },
    } = this.props;

    if (!width || !height) return undefined;

    return height / width;
  }

  get isVideo() {
    return this.props.type === LinkPreviewType.Video;
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

  renderVideoBanner() {
    return (
      <div className='link-preview__banner'>
        <VideoPlayer className='link-preview__banner-video' url={this.props.url} autoplay={false} />
      </div>
    );
  }

  renderBanner() {
    if (this.isVideo) return this.renderVideoBanner();

    const { thumbnail, providerName } = this.props;

    if (!thumbnail || !this.width) return null;

    let source = thumbnail.url;
    const options: any = {
      width: this.width,
      crop: 'fill',
    };

    if (providerName === 'Twitter') {
      options.background = 'transparent';
      source = TWITTER_LOGO;
    }

    const props: BackgroundImageProperties = {
      source,
      options,
      className: 'link-preview__banner-image',
      provider: cloudinaryProvider,
    };

    const ratio = this.bannerRatio;

    if (ratio) {
      const height = Math.round(ratio * this.width);
      const maxHeight = Math.round(2 * this.width);

      props.style = { height: `${Math.min(height, maxHeight)}px` };
    } else {
      props.autoHeight = true;
    }

    return (
      <div className='link-preview__banner'>
        <BackgroundImage {...props} />
      </div>
    );
  }

  render() {
    const { className, description, url, providerName } = this.props;

    return (
      <div ref={this.ref} className={classNames('link-preview', className)} onClick={this.handleOnClick}>
        {this.renderBanner()}
        <div className='link-preview__body'>
          <ButtonLink url={this.titleUrl} openInNewTab className='link-preview__title'>
            {this.title}
          </ButtonLink>
          <div className='link-preview__description'>{description}</div>
        </div>
        <div className='link-preview__footer'>
          <ButtonLink className='link-preview__content-link' url={url} openInNewTab>
            View this on <span className='link-preview__content-provider'>{providerName}</span>
          </ButtonLink>
        </div>
      </div>
    );
  }
}
