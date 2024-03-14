import * as React from 'react';

import { Button, IconButton, Modal as ZuiModal } from '@zero-tech/zui/components';
import { IconXClose } from '@zero-tech/zui/icons';

import { bemClassName } from '../../lib/bem';
import './styles.scss';

const cn = bemClassName('modal');

export enum Variant {
  Primary = 'primary',
  Secondary = 'secondary',
  LegacySecondary = 'negative', // Until zUI aligns with the design and we can specify the color
}

export enum Color {
  Red = 'red',
  Greyscale = 'greyscale',
  Highlight = 'highlight',
}

export interface Properties {
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
      <ZuiModal open={true} onOpenChange={this.publishIfClosing}>
        <div {...cn('')}>
          <div {...cn('title-bar')}>
            <h3 {...cn('title')}>{this.props.title}</h3>
            <IconButton {...cn('close')} size='large' Icon={IconXClose} onClick={this.props.onClose} />
          </div>

          <div {...cn('body')}>{this.props.children}</div>

          <div {...cn('footer')}>
            {this.props.onSecondary && (
              <Button
                {...cn('secondary-button')}
                variant={this.secondaryVariant}
                onPress={this.props.onSecondary}
                isDisabled={this.props.secondaryDisabled}
              >
                <div
                  {...cn(
                    'text-button-text',
                    this.secondaryVariant === 'text' && (this.props.secondaryColor || Color.Highlight)
                  )}
                >
                  {this.props.secondaryText}
                </div>
              </Button>
            )}

            {this.props.onPrimary && (
              <Button
                {...cn('primary-button')}
                variant={this.primaryVariant}
                onPress={this.props.onPrimary}
                isLoading={this.props.isProcessing}
                isDisabled={this.props.primaryDisabled}
              >
                <div
                  {...cn(
                    'text-button-text',
                    this.primaryVariant === 'text' && (this.props.primaryColor || Color.Highlight)
                  )}
                >
                  {this.props.primaryText}
                </div>
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
