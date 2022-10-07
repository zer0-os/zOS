import React from 'react';
import { RootState } from './store';
import { connectContainer } from './store/redux-container';
import { WalletManager } from './components/wallet-manager';
import { ViewModeToggle } from './components/view-mode-toggle';
import { ThemeEngine } from './components/theme-engine';
import { AddressBarContainer } from './components/address-bar/container';
import { AppMenuContainer } from './components/app-menu/container';
import { Logo } from './components/logo';

import './main.scss';
import classNames from 'classnames';

export interface Properties {
  hasContextPanel: boolean;
  isContextPanelOpen: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const layout = state.layout.value;

    return {
      hasContextPanel: layout.hasContextPanel,
      isContextPanelOpen: layout.isContextPanelOpen,
    };
  }

  static mapActions(_state: RootState): Partial<Properties> {
    return {};
  }

  render() {
    const mainClassName = classNames('main', {
      'is-context-panel-open': this.props.isContextPanelOpen,
      'has-context-panel': this.props.hasContextPanel,
    });

    return (
      <div className={mainClassName}>
        <div className='main__navigation'>
          <div className='main__navigation-world'>
            <ViewModeToggle className='main__view-mode-toggle' />
          </div>
          <div className='main__navigation-platform'>
            <Logo className='main__logo' />
            <div className='main__app-menu-container'>
              <AppMenuContainer />
            </div>
          </div>
        </div>
        <div className='main__header'>
          <div className='main__address-bar-wrapper'>
            <AddressBarContainer className='main__address-bar' />
          </div>
          <div className='main__wallet-manager-wrapper'>
            <WalletManager className='main__wallet-manager' />
          </div>
        </div>
        <ThemeEngine />
      </div>
    );
  }
}

export const Main = connectContainer<{}>(Container);
