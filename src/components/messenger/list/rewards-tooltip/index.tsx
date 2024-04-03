import * as React from 'react';

import { TooltipPopup } from '../../../tooltip-popup/tooltip-popup';

export interface Properties {
  meowPreviousDayInUSD: string;
  open: boolean;

  onClose: () => void;
}

export class RewardsTooltip extends React.Component<Properties> {
  render() {
    return (
      <TooltipPopup
        open={this.props.open}
        align='center'
        side='right'
        content={`You earned ${this.props.meowPreviousDayInUSD}`}
        onClose={this.props.onClose}
      />
    );
  }
}
