import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { IconLogoZero } from '@zero-tech/zui/icons';
import { getLoadingMessage } from './utils';
import { Panel, PanelBody } from '../layout/panel';

import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('loading-screen');

export interface PublicProperties {}

interface Properties extends PublicProperties {
  progress: number;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { loadingConversationProgress } = state.chat;

    return {
      progress: loadingConversationProgress,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    const { progress } = this.props;

    // Makes progress bar appear full at 90% to ensure users see a completed bar
    // before the screen transitions away
    const visualProgress = progress >= 90 ? 100 : (progress * 100) / 90;

    const loadingMessage = getLoadingMessage(progress);

    return (
      <Panel {...cn('')}>
        <PanelBody {...cn('panel')}>
          <div {...cn('content')}>
            <div {...cn('icon-container')}>
              <IconLogoZero {...cn('icon')} size={64} />
            </div>
            <div {...cn('progress-container')}>
              <div {...cn('progress-bar')}>
                <div {...cn('progress-indicator')} style={{ width: `${visualProgress}%` }}></div>
              </div>
            </div>
            <div {...cn('message')}>{loadingMessage}</div>
          </div>
        </PanelBody>
      </Panel>
    );
  }
}

export const LoadingScreenContainer = connectContainer<PublicProperties>(Container);
