import React from 'react';
import { ViewModeToggle } from './components/view-mode-toggle';
import { ThemeEngine } from './components/theme-engine';

import './main.scss';

export interface Properties {}

export class Main extends React.Component<Properties> {
  render() {
    return (
      <div className='main'>
        <div className='main__navigation'>
          <div className='main__navigation-world'>
            <ViewModeToggle className='main__view-mode-toggle' />
          </div>
        </div>

        <ThemeEngine />
      </div>
    );
  }
}
