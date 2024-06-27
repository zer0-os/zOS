import React from 'react';

import { bemClassName } from '../../../lib/bem';
import { Button, Color, Size, Variant } from '@zero-tech/zui/components/Button';
import { Tooltip } from '@zero-tech/zui/components';

import './styles.scss';

const cn = bemClassName('edit-message-actions');

export interface Properties {
  className?: string;
  value: string;
  primaryTooltipText: string;
  secondaryTooltipText: string;
  onEdit: () => void;
  onCancel?: () => void;
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

  // scrolls the element into view if it is not already in view
  scrollIntoView = () => {
    const editMessageActionRef = this.editMessageActionRef?.current;
    if (editMessageActionRef) {
      editMessageActionRef.scrollIntoView({ block: 'nearest' });
    }
  };

  componentDidMount(): void {
    this.scrollIntoView();
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
        {/* See: ZOS-115
         * @ts-ignore */}
        <Tooltip content={this.props.secondaryTooltipText}>
          <Button color={Color.Greyscale} onPress={this.props.onCancel} size={Size.Small} variant={Variant.Secondary}>
            Cancel
          </Button>
        </Tooltip>
        {/* See: ZOS-115
         * @ts-ignore */}
        <Tooltip
          content={this.props.primaryTooltipText}
          open={this.state.tooltipOpen}
          onOpenChange={this.handleTooltipChange}
        >
          <Button
            color={Color.Highlight}
            isDisabled={isDisabled}
            onPress={this.props.onEdit}
            size={Size.Small}
            variant={Variant.Secondary}
          >
            Send
          </Button>
        </Tooltip>
      </div>
    );
  }
}
