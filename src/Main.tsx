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
      <div className='main'>
        <div className='main__header'>
          <Link className='main__title' to={`/${config.defaultZnsRoute}`}>
            <span>zOS</span>
          </Link>
          <ViewModeToggle />
          <WalletManager />
        </div>
        <ThemeEngine />
      </div>
    );
  }
}
