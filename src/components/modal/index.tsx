import * as React from 'react';

import { IconButton, Modal as ZuiModal } from '@zero-tech/zui/components';
import { Button } from '@zero-tech/zui/components/Button';
import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('modal');

export enum Variant {
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum Color {
  Red = 'red',
  Greyscale = 'greyscale',
  Highlight = 'highlight',
}

export interface Properties {
  className?: string;
  children?: React.ReactNode;
  title: string;
  primaryText?: string;
  primaryVariant?: Variant;
  primaryColor?: Color;
  primaryDisabled?: boolean;
  secondaryText?: string;
  secondaryVariant?: Variant;
  secondaryColor?: Color;
  secondaryDisabled?: boolean;
  isProcessing?: boolean;

  onClose: () => void;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export class Modal extends React.Component<Properties> {
  componentWillUnmount(): void {
    // The radix-ui library that underpins zUI has issues where the various dropdowns/selects/etc
    // end up modifying the body and disabling pointer events when the dialog is closed.
    // This is a total hack to re-enable pointer events after a short delay.
    // https://github.com/radix-ui/primitives/issues/1241
    setTimeout(() => {
      document.body.style.pointerEvents = '';
    }, 1000);
  }

  publishIfClosing = (open: boolean) => {
    if (!open) {
      this.props.onClose();
    }
  };

  render() {
    return (
      <ZuiModal open={true} onOpenChange={this.publishIfClosing} className={this.props.className}>
        <div {...cn('')}>
          <div {...cn('title-bar')}>
            <h3 {...cn('title')}>{this.props.title}</h3>
            <IconButton {...cn('close')} size='large' Icon={IconXClose} onClick={this.props.onClose} />
          </div>

          <div {...cn('body')}>{this.props.children}</div>

          <div {...cn('footer')}>
            {this.props.onSecondary && (
              <Button
                color={this.props.secondaryColor}
                variant={this.props.secondaryVariant}
                onPress={this.props.onSecondary}
                isDisabled={this.props.secondaryDisabled}
              >
                {this.props.secondaryText}
              </Button>
            )}

            {this.props.onPrimary && (
              <Button
                color={this.props.primaryColor}
                variant={this.props.primaryVariant}
                onPress={this.props.onPrimary}
                isLoading={this.props.isProcessing}
                isDisabled={this.props.primaryDisabled}
              >
                {this.props.primaryText}
              </Button>
            )}
          </div>
        </div>
      </ZuiModal>
    );
  }

  private get primaryVariant() {
    return this.translateVariant(this.props.primaryVariant, Variant.Primary);
  }

  private get secondaryVariant() {
    return this.translateVariant(this.props.secondaryVariant, Variant.Secondary);
  }

  private translateVariant(variant: Variant, defaultVariant: Variant) {
    const defaultedVariant = variant || defaultVariant;

    // As the button design has changed the terminology for the variants
    // has shifted. This is a temporary fix until zUI aligns with the design
    return defaultedVariant === Variant.Secondary ? 'text' : defaultedVariant;
  }
}
