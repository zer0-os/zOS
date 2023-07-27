import * as React from 'react';
import { Link } from 'react-router-dom';

import { bem } from '../../lib/bem';
import './styles.scss';

const c = bem('invite-footer');

export class Footer extends React.Component {
  render() {
    return (
      <div className={c('')}>
        <div>
          <span>Already on ZERO? </span>
          <Link to='/login'>Log in</Link>
        </div>

        <div>
          <span>Dont have an invite code? </span>
          <a href='https://www.zine.live/#/portal/signup'>Subscribe for updates</a>
        </div>
      </div>
    );
  }
}
