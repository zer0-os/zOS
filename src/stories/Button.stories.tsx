import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Button } from '../shared-components/button';

export default {
  title: 'Button',
  component: Button,
  args: {
    className: 'storybook-button',
  },
} as ComponentMeta<typeof Button>;

export const WithLabel = (args) => <Button label='Launch!' {...args} />;
export const WithChild = (args) => (
  <Button {...args}>
    <div className='storybook-button__child'>Click Me!!!</div>
  </Button>
);
