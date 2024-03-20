import * as React from 'react';
import './styles.scss';
import { bem } from '../../lib/bem';
import type { ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { IconXClose } from '@zero-tech/zui/icons';
import { IconButton } from '@zero-tech/zui/components';
import { ReactComponent as TooltipHead } from '../../tooltip-head.svg';

const c = bem('tooltip-popup');

export interface Properties {
  open?: TooltipPrimitive.TooltipProps['open'];
  onOpenChange?: TooltipPrimitive.TooltipProps['onOpenChange'];
  side?: TooltipPrimitive.TooltipContentProps['side'];
  align?: TooltipPrimitive.TooltipContentProps['align'];
  content?: ReactNode;
  onClose: () => void;
}

// TODO: move to zUI
// reference: https://github.com/zer0-os/zUI/blob/master/src/components/Tooltip/Tooltip.tsx
export class TooltipPopup extends React.Component<Properties> {
  render() {
    return (
      <div className={c('')}>
        <TooltipPrimitive.Provider>
          <TooltipPrimitive.Root open={this.props.open} onOpenChange={this.props.onOpenChange} delayDuration={200}>
            <TooltipPrimitive.Trigger asChild className={c('trigger')}>
              <span tabIndex={0}>{this.props.children}</span>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Content side={this.props.side} align={this.props.align} className={c('content')}>
              {this.props.content}
              <TooltipHead className={c('arrow')} />
              <IconButton className={c('close-icon')} Icon={IconXClose} size='x-small' onClick={this.props.onClose} />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      </div>
    );
  }
}
