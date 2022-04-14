import React from 'react';
import { WalletManager } from './components/wallet-manager';
import { ViewModeToggle } from './components/view-mode-toggle';
import { ThemeEngine } from './components/theme-engine';
import { AddressBarContainer } from './components/address-bar/container';

import './main.scss';

// Renamed from App to Main to reduce confusion around
// apps & app due to the intent of this project.
export class Main extends React.Component {
  render() {
    return (
      <div className='app-main'>
        <div className='container main'>
          <div className='container__left-sidebar'>
            <div className='container__networks'></div>
          </div>
          <div className='container__content'>
            <AddressBarContainer className='main__address-bar' />
          </div>
          <div className='container__sidekick'>
            <ViewModeToggle />
            <WalletManager />
          </div>
          <ThemeEngine />
        </div>
      </div>
    );
  }
}
