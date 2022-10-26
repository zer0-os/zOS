import { ZnsLink } from '@zer0-os/zos-component-library';
import React from 'react';

export interface Properties {
  className: string;
  to: string;
}

export class ChannelListLink extends React.Component<Properties> {
  private linkRef;

  constructor(props) {
    super(props);
    this.linkRef = React.createRef();
  }

  render() {
    const { children, className, to } = this.props;

    return (
      <ZnsLink
        innerRef={this.linkRef}
        className={className}
        to={to}
        onMouseDown={() => {
          if (this.linkRef && this.linkRef.current) {
            this.linkRef.current.click();
          }
        }}
      >
        {children}
      </ZnsLink>
    );
  }
}
