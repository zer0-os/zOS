import React from 'react';
import classNames from 'classnames';
import { Portal } from 'react-portal';
import { Context as EscapeManagerContext } from '../../lib/escape-manager';

import './styles.scss';

export interface Properties {
  className?: string;
  onClose?: () => void;
}

export class Dialog extends React.Component<Properties> {
  static contextType = EscapeManagerContext;

  componentDidMount() {
    // See note in test file. This is conditional due to
    // incompatibilities between function and class components
    // in react and the resulting enzyme support.
    if (this.context.register) {
      this.context.register(this.props.onClose);
    }
  }

  componentWillUnmount() {
    if (this.context.unregister) {
      this.context.unregister();
    }
  }

  handleClose = () => this.props.onClose && this.props.onClose();

  render() {
    return (
      <Portal>
        <div className={classNames('dialog', this.props.className)}>
          <div className='dialog__underlay' onClick={this.handleClose} />
          <div className='dialog__content'>
            {this.props.children}
          </div>
        </div>
      </Portal>
    );
  }
}
