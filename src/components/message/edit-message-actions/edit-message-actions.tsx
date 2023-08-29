import React from 'react';

import { bemClassName } from '../../../lib/bem';

import { IconCheck, IconXClose } from '@zero-tech/zui/icons';
import { IconButton, Tooltip } from '@zero-tech/zui/components';

import './styles.scss';
import InvertedScroll from '../../inverted-scroll';

const cn = bemClassName('edit-message-actions');

export interface Properties {
  className?: string;
  value: string;
  primaryTooltipText: string;
  secondaryTooltipText: string;
  onEdit: () => void;
  onCancel?: () => void;
  scrollContainerRef: React.RefObject<InvertedScroll>;
}

export default class EditMessageActions extends React.Component<Properties> {
  state = {
    tooltipOpen: false,
  };

  editMessageActionRef: React.RefObject<HTMLDivElement>;

  constructor(props: Properties) {
    super(props);
    this.editMessageActionRef = React.createRef();
  }

  // scrolls up if 'x' or 'check' button is hidden in bottom of the screen (while editing a message)
  fixScroll = () => {
    const scrollRef = this.props.scrollContainerRef?.current;
    const editMessageActionRef = this.editMessageActionRef?.current;
    if (scrollRef && editMessageActionRef) {
      const clientHeight = scrollRef.scrollWrapper.clientHeight + 64;
      const bottom = editMessageActionRef.getBoundingClientRect().bottom;

      const diff = clientHeight - bottom;
      if (diff < 0) {
        scrollRef.scrollWrapper.scrollTop += Math.abs(diff) + 16;
      }
    }
  };

  componentDidMount(): void {
    this.fixScroll();
  }

  handleTooltipChange = (open: boolean) => {
    this.setState({ tooltipOpen: !this.isDisabled() && open });
  };

  isDisabled = () => {
    return !this.props.value.trim();
  };

  render() {
    const isDisabled = this.isDisabled();

    return (
      <div {...cn()} ref={this.editMessageActionRef}>
        <Tooltip content={this.props.secondaryTooltipText}>
          <IconButton {...cn('icon')} onClick={this.props.onCancel} Icon={IconXClose} isFilled size={24} />
        </Tooltip>
        <Tooltip
          content={this.props.primaryTooltipText}
          open={this.state.tooltipOpen}
          onOpenChange={this.handleTooltipChange}
        >
          <IconButton
            {...cn('icon', isDisabled && 'disabled')}
            onClick={this.props.onEdit}
            Icon={IconCheck}
            isDisabled={isDisabled}
            isFilled
            size={24}
          />
        </Tooltip>
      </div>
    );
  }
}
