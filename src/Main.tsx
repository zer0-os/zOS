import React from 'react';
import { Link } from 'react-router-dom';
import { WalletManager } from './core-components/wallet-manager';
import { config } from './config';
import { ViewModeToggle } from './core-components/view-mode-toggle';
import { ThemeEngine } from './core-components/theme-engine';

import './main.scss';

// Renamed from App to Main to reduce confusion around
// apps & app due to the intent of this project.
export class Main extends React.Component {
  render() {
    return (
      <div className='flex flex-row items-center h-[64px] space-x-1'>
        <div className='justify-center basis-[20px]'>{/* World image */}
          <Link to={`/${config.defaultZnsRoute}`}>
            <span className='text-3xl'>zOS</span>
          </Link>
        </div>
        <div className='grow'>{/* Search */}
        </div>
        <div className='flex justify-end basis-[207px]'>{/* Wallet, User Menu */}
          <ViewModeToggle />
          <WalletManager />
        </div>
        <ThemeEngine />
      </div>
    );
  }
}
