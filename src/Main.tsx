import React from 'react';
import { Link } from 'react-router-dom';
import { WalletManager } from './components/wallet-manager';
import { config } from './config';
import { ViewModeToggle } from './components/view-mode-toggle';
import { ThemeEngine } from './components/theme-engine';
import { AddressBarContainer } from './components/address-bar/container';

import './main.scss';

// Renamed from App to Main to reduce confusion around
// apps & app due to the intent of this project.
export class Main extends React.Component {
  render() {
    return (
      <div className='main'>
        <div className='main__header'>
          <Link className='main__title' to={`/${config.defaultZnsRoute}`}>
            <span>zOS</span>
          </Link>
          <AddressBarContainer className='main__address-bar' />
          <ViewModeToggle />
          <WalletManager />
        </div>
        <ThemeEngine />
      </div>
    );
  }
}
