import { ZnsLink } from '@zer0-os/zos-component-library';
import React from 'react';

export interface PublicProperties {
  className?: string;
  to: string;
}

interface Properties extends PublicProperties {
  innerRef: any;
}

export class Component extends React.Component<Properties> {
  render() {
    const { children, className, to, innerRef } = this.props;
    return (
      <ZnsLink
        innerRef={innerRef}
        className={className}
        to={to}
        onMouseDown={() => {
          if (innerRef && innerRef.current) {
            innerRef.current.click();
          }
        }}
      >
        {children}
      </ZnsLink>
    );
  }
}

export class ChannelListLink extends React.Component<PublicProperties> {
  private linkRef;

  constructor(props) {
    super(props);
    this.linkRef = React.createRef();
  }

  render() {
    return (
      <Component
        innerRef={this.linkRef}
        {...this.props}
      >
        {this.props.children}
      </Component>
    );
  }
}
