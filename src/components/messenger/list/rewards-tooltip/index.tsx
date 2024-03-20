import * as React from 'react';

import { TooltipPopup } from '../../../tooltip-popup/tooltip-popup';

export interface Properties {
  meowPreviousDayInUSD: string;
}

interface State {
  isTooltipOpen: boolean;
}

export class RewardsTooltip extends React.Component<Properties, State> {
  state = {
    isTooltipOpen: true,
  };

  componentDidMount(): void {
    // setTimeout(() => {
    //   this.setState({ isTooltipOpen: false });
    // }, 5000);
  }

  closeTooltip = () => {
    this.setState({ isTooltipOpen: false });
  };

  render() {
    return (
      <TooltipPopup
        open={this.state.isTooltipOpen}
        align='center'
        side='right'
        content={`You earned ${this.props.meowPreviousDayInUSD}`}
        onClose={this.closeTooltip}
      />
    );
  }
}
