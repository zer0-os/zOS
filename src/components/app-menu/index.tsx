import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { PlatformApp, Apps } from '../../lib/apps';

import './styles.scss';

export interface Properties {
  className?: string;

  selectedApp: Apps;
  apps: PlatformApp[];

  route: string;
}

export class AppMenu extends React.Component<Properties> {
  renderApps() {
    return this.props.apps.map(app => {
      const className = classNames('app-menu__app', {
        selected: app.type === this.props.selectedApp,
      });

      const { type, name, imageSource } = app;

      return (
        <li key={type} className={className}>
          <Link to={`/${[this.props.route, type].join('/')}`}>
            <img className="app-menu__app-image" src={imageSource} alt={name} />
            <span className="app-menu__app-name">{name}</span>
          </Link>
        </li>
      );
    });
  }

  render() {
    return (
      <div className={classNames('app-menu', this.props.className)}>
        <ul className='app-menu__apps'>
          {this.renderApps()}
        </ul>
      </div>
    );
  }
}
