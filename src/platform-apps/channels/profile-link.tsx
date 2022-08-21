import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface Properties {
  id: string;
  className?: string;
}

export default class ProfileLink extends React.Component<Properties, undefined> {
  render() {
    if (!this.props.id) {
      return <span className={this.props.className}>{this.props.children}</span>;
    }

    const linkProps: LinkProps = {
      to: '#',
      className: this.props.className,
    };

    return <Link {...linkProps}>{this.props.children}</Link>;
  }
}
