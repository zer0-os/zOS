import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { ReactComponent as ZeroLogo } from './zero-logo.svg';
import { Wizard, Input, Button } from '@zero-tech/zui/components';

import './invite.scss';

export interface Properties {
  isAuthenticated: boolean;
}

export class Container extends React.Component {
  static mapState(_state: RootState): Partial<Properties> {
    return {
      isAuthenticated: true,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  componentDidMount() {}

  render() {
    return (
      <>
        <div className='main'>
          <ZeroLogo className='main__logo' />

          <Wizard.Container className='main__title'>
            <Wizard.Header
              header='Add your invite code'
              //headerInfo="This is the 6 digit code you received in your invite"
              subHeader='This is the 6 digit code you received in your invite'
            />
          </Wizard.Container>
          <Input
            label={<div className='main__input__label'> E.g. 123456 </div>}
            onChange={function noRefCheck() {}}
            //placeholder="eg. 123456"
            value=''
            className='main__input'
          />
          <Button variant='primary' className='main__button' isDisabled={true}>
            Get access
          </Button>
        </div>
      </>
    );
  }
}

export const Invite = connectContainer<{}>(Container);
