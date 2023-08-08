import * as React from 'react';

import { Link } from 'react-router-dom';
import { RegistrationStage } from '../../store/registration';

import { bem } from '../../lib/bem';
import './styles.scss';

const c = bem('authentication-footer');

export interface Properties {
  stage: RegistrationStage;
}

export class Footer extends React.Component<Properties> {
  render() {
    if (this.props.stage === RegistrationStage.ProfileDetails) {
      return null;
    }

    return (
      <div className={c('')}>
        <div>
          <span>{this.props.stage === RegistrationStage.ResetPassword ? 'Back to ' : 'Already on ZERO? '}</span>
          <Link to='/login'>Log in</Link>
        </div>

        {this.props.stage === RegistrationStage.ValidateInvite && (
          <div>
            <span>Dont have an invite code? </span>
            <a href='https://www.zine.live/#/portal/signup'>Subscribe for updates</a>
          </div>
        )}
      </div>
    );
  }
}
