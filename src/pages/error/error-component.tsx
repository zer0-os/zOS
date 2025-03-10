import React from 'react';

import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';
import { Button } from '@zero-tech/zui/components';
import ZeroLogo from '../../zero-logo.svg?react';

import { bemClassName } from '../../lib/bem';
import './error.scss';

const cn = bemClassName('error-page');

interface ErrorComponentProperties {
  onRetry: () => void;
}

export const ErrorComponent = ({ onRetry }: ErrorComponentProperties) => {
  return (
    <>
      <ThemeEngine theme={Themes.Dark} />
      <div {...cn('')}>
        <main {...cn('content')}>
          <div {...cn('logo-container')}>
            <ZeroLogo />
          </div>
          <div {...cn('message-container')}>
            <h3 {...cn('message')}>There was an error loading ZERO, please try again.</h3>
            <Button onPress={onRetry}>Try Again</Button>
          </div>
        </main>
      </div>
    </>
  );
};
