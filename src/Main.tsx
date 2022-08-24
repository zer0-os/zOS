import React from 'react';
import { WalletManager } from './components/wallet-manager';
import { ViewModeToggle } from './components/view-mode-toggle';
import { ThemeEngine } from './components/theme-engine';
import { AddressBarContainer } from './components/address-bar/container';
import { AppMenuContainer } from './components/app-menu/container';
import { Logo } from './components/logo';

import './main.scss';

// Renamed from App to Main to reduce confusion around
// apps & app due to the intent of this project.
export class Main extends React.Component {
  render() {
    return (
      <div className='main'>
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
          <AddressBarContainer className='main__address-bar' />
        </div>
        <div className='main__sidekick'>
          <WalletManager />
        </div>
        <ThemeEngine />
      </div>
    );
  }
}
