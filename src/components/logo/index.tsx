import React from 'react';
import { ZnsLink } from '@zer0-os/zos-component-library';
import { ReactComponent as WilderWideLogo } from '../../assets/images/wilder-wide-logo.svg';
import { inject as injectConfig } from '../config';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  config: { defaultZnsRoute: string };
}

export class Container extends React.Component<Properties> {
  get defaultRoute(): string {
    return this.props.config.defaultZnsRoute;
  }

  render() {
    return (
      <ZnsLink route={this.defaultRoute}>
        <WilderWideLogo className={this.props.className} />
      </ZnsLink>
    );
  }
}

export const Logo = injectConfig<PublicProperties>(Container);
