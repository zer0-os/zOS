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
      <div className='container main'>
        <div className='container__networks'>
          <ViewModeToggle className='main__view-mode-toggle' />
        </div>
        <div className='container__network'>
          <img src='https://res.cloudinary.com/fact0ry-dev/image/upload/v1647373698/zero-assets/zer0-os/network-identifier-wilder-world.png' alt='Wilder World' />
        </div>
        <div className='container__content'>
          <AddressBarContainer className='main__address-bar' />
        </div>
        <div className='container__sidekick'>
          <WalletManager />
        </div>
        <ThemeEngine />
      </div>
    );
  }
}
