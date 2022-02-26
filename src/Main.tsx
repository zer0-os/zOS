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
      <div className='flex flex-row items-center h-[64px] px-[3.5rem] space-x-1 main'>
        <div className='justify-center basis-world-image'>{/* World image */}
          <Link to={`/${config.defaultZnsRoute}`}>
            <span>zOS</span>
          </Link>
        </div>
        <div className='grow'>
          <AddressBarContainer className='main__address-bar' />
        </div>
        <div className='flex justify-end basis-user-utilities'>{/* Wallet, User Menu */}
          <ViewModeToggle />
          <WalletManager />
        </div>
        <ThemeEngine />
      </div>
    );
  }
}
