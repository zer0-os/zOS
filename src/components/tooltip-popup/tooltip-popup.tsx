import * as React from 'react';
import './styles.scss';
import { bem } from '../../lib/bem';
import type { ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { IconButton } from '../icon-button';
import { IconXClose } from '@zero-tech/zui/icons';

const c = bem('tooltip-popup');

export interface Properties {
  open?: TooltipPrimitive.TooltipProps['open'];
  onOpenChange?: TooltipPrimitive.TooltipProps['onOpenChange'];
  side?: TooltipPrimitive.TooltipContentProps['side'];
  align?: TooltipPrimitive.TooltipContentProps['align'];
  content?: ReactNode;
  onClose: () => void;
}

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
              <TooltipPrimitive.Arrow className={c('arrow')} width={32} height={16} />
              <IconButton className={c('close')} Icon={IconXClose} onClick={this.props.onClose} />
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      </div>
    );
  }
}
