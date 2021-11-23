import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import './Main.css';

// Renamed from App to Main to reduce confusion around apps & app due to the intent of this project.
export class Main extends React.Component {
  render() {
    return (
      <div className="Main">
        <header className="Main-header">
          <img src={logo} className="Main-logo" alt="logo" />
          <Counter />
        </header>
      </div>
    );
  }
}
