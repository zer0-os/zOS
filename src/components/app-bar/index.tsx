import * as React from 'react';

import { WorldPanelItem } from './world-panel-item';
import { IconDotsGrid, IconGlobe3, IconMessageSquare2 } from '@zero-tech/zui/icons';
import { MoreAppsModal } from './more-apps-modal';
import { Link } from 'react-router-dom';

import { bemClassName } from '../../lib/bem';

import './styles.scss';
import { FeatureFlag } from '../feature-flag';

const cn = bemClassName('app-bar');

export interface Properties {}

interface State {
  isModalOpen: boolean;
}

export class AppBar extends React.Component<Properties, State> {
  state = { isModalOpen: false };

  openModal = () => this.setState({ isModalOpen: true });
  closeModal = () => this.setState({ isModalOpen: false });

  render() {
    return (
      <>
        <div {...cn('')}>
          <WorldPanelItem Icon={IconMessageSquare2} label='Messenger' isActive />
          <FeatureFlag featureFlag='enableExplorer'>
            <Link to='/explorer'>
              <WorldPanelItem Icon={IconGlobe3} label='Explorer' isActive={false} />
            </Link>
          </FeatureFlag>
          <WorldPanelItem Icon={IconDotsGrid} label='More Apps' isActive={false} onClick={this.openModal} />
        </div>
        {this.state.isModalOpen && <MoreAppsModal onClose={this.closeModal} />}
      </>
    );
  }
}
