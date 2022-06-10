import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as WilderWideLogo } from '../../assets/images/wilder-wide-logo.svg';
import { routeWithApp } from '../address-bar/util';
import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store';
import { Apps } from '../../lib/apps';
import { config } from '../../config';

interface PublicProperties {
  className?: string;
  
}
export interface Properties extends PublicProperties {
  type: Apps;
}
export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      apps: {
        selectedApp: { type },
      },
    } = state;

    return {
      type,
    };
  }

  get defaultRoute(): string {
    return config.defaultZnsRoute;
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <Link to={routeWithApp(this.defaultRoute, this.props.type)}>
        <WilderWideLogo className={this.props.className} />
      </Link>
    );
  }
}

export const Logo = connectContainer<PublicProperties>(Container);
