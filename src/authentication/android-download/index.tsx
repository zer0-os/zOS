import * as React from 'react';

import { bemClassName } from '../../lib/bem';

import './styles.scss';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';

const cn = bemClassName('android-download');

export interface Properties {
  storePath: string;
  onUseBrowser: () => void;
}

export class AndroidDownload extends React.Component<Properties> {
  render() {
    return (
      <div {...cn()}>
        <div {...cn('content')}>
          <span {...cn('header')}>Get the ZERO Android app for the best experience</span>
          <div {...cn('button-row')}>
            <a {...cn('app-link')} href={this.props.storePath}>
              Install app
            </a>
            <Button onPress={this.props.onUseBrowser} variant={ButtonVariant.Secondary}>
              Continue in browser
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
