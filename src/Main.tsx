import React from 'react';
import { WalletManager } from './components/wallet-manager';
import { ViewModeToggle } from './components/view-mode-toggle';
import { ThemeEngine } from './components/theme-engine';
import { AddressBarContainer } from './components/address-bar/container';
import { ReactComponent as WilderWideLogo } from './assets/images/wilder-wide-logo.svg';
import { AppMenuContainer } from './components/app-menu/container';

import './main.scss';

// Renamed from App to Main to reduce confusion around
// apps & app due to the intent of this project.
export class Main extends React.Component {
  render() {
    return (
      <div className='app-main'>
        <div className='container main'>
          <div className='container__left-sidebar'>
            <div className='container__navigation-world'>
              <ViewModeToggle className='main__view-mode-toggle' />
            </div>
            <div className='app-sandbox__navigation-platform'>
              <div className='app-sandbox__navigation-content'>
                <div className='container__network'>
                  <WilderWideLogo className="logo-wilder-wide"/>
                </div>
                <div className='container__navigation'>
                  <AppMenuContainer />
                </div>
              </div>
            </div>
          </div>
          <div className='container__content'>
            <AddressBarContainer className='main__address-bar' />
          </div>
          <div className='container__sidekick'>
            <WalletManager />
          </div>
          <ThemeEngine />
        </div>
      </div>
    );
  }
}
