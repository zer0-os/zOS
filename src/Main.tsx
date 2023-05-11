import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { WalletManager } from './components/wallet-manager';
import { ViewModeToggle } from './components/view-mode-toggle';
import { ThemeEngine } from './components/theme-engine';
import { AddressBarContainer } from './components/address-bar/container';
import { AppMenuContainer } from './components/app-menu/container';
import { Logo } from './components/logo';

import './main.scss';
import classNames from 'classnames';
import { Sidekick } from './components/sidekick/index';
import { withContext as withAuthenticationContext } from './components/authentication/context';
import { MessengerChat } from './components/messenger/chat';

export interface Properties {
  hasContextPanel: boolean;
  isContextPanelOpen: boolean;
  isSidekickOpen: boolean;
  isMessengerFullScreen: boolean;
  context: {
    isAuthenticated: boolean;
  };
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const layout = state.layout.value;

    if (layout.isMessengerFullScreen) {
      return {
        hasContextPanel: false,
        isContextPanelOpen: false,
        isSidekickOpen: true,
        isMessengerFullScreen: true,
      };
    }

    return {
      hasContextPanel: layout.hasContextPanel,
      isContextPanelOpen: layout.isContextPanelOpen,
      isSidekickOpen: layout.isSidekickOpen,
      isMessengerFullScreen: false,
    };
  }

  static mapActions(_state: RootState): Partial<Properties> {
    return {};
  }

  render() {
    const mainClassName = classNames('main', {
      'context-panel-open': this.props.isContextPanelOpen,
      'sidekick-panel-open': this.props.isSidekickOpen && this.props.context.isAuthenticated,
      'has-context-panel': this.props.hasContextPanel,
      'messenger-full-screen': this.props.isMessengerFullScreen,
    });

    return (
      <div className={mainClassName}>
        <div className='main__navigation'>
          <div className='main__navigation-world'>
            <div></div>
            <div></div>
            <div>
              <ViewModeToggle className='main__view-mode-toggle' />
            </div>
          </div>
          {!this.props.isMessengerFullScreen && (
            <div className='main__navigation-platform'>
              <div>
                <div className='main__network'>
                  <Logo className={'main__network__logo'} />
                  <span>Wilder World</span>
                </div>
              </div>
              <div className='main__app-menu-container'>
                <AppMenuContainer />
              </div>
              <div></div>
            </div>
          )}
        </div>
        {!this.props.isMessengerFullScreen && (
          <div className='main__header'>
            <div className='main__address-bar-wrapper'>
              <AddressBarContainer className='main__address-bar' />
            </div>
            <div className='main__wallet-manager-wrapper'>
              <WalletManager className='main__wallet-manager' />
            </div>
          </div>
        )}

        {this.props.context.isAuthenticated && <Sidekick className='main__sidekick' />}

        <ThemeEngine />

        {this.props.context.isAuthenticated && <MessengerChat />}
      </div>
    );
  }
}

export const Main = withAuthenticationContext<{}>(connectContainer<{}>(Container));
