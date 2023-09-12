import React from 'react';
import classNames from 'classnames';
import { default as ReactTooltip } from 'rc-tooltip';
import { TooltipProps } from 'rc-tooltip/lib/Tooltip';
import './styles.scss';

export interface Properties extends TooltipProps {
  className?: string;
}

export default class Tooltip extends React.Component<Properties> {
  render() {
    const { overlay } = this.props;
    const hasOverlayContent = overlay && overlay !== '';

    if (!hasOverlayContent) {
      return <>{this.props.children}</>;
    }

    return (
      <ReactTooltip
        overlayClassName={classNames('tooltip', this.props.className)}
        showArrow={false}
        mouseEnterDelay={0.1}
        mouseLeaveDelay={0.2}
        destroyTooltipOnHide={true}
        {...this.props}
      >
        {this.props.children}
      </ReactTooltip>
    );
  }
}
