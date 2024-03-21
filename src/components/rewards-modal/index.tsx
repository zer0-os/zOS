import * as React from 'react';

import { IconButton, Modal } from '@zero-tech/zui/components';
import { IconArrowRight, IconXClose } from '@zero-tech/zui/icons';
import { ReactComponent as ZeroSymbol } from '../../zero-symbol.svg';

import { bemClassName } from '../../lib/bem';
import './styles.scss';
import { Faq } from './faq';

const cn = bemClassName('rewards-modal');

export interface Properties {
  totalUSD: string;
  totalMeow: string;

  onClose: () => void;
}

interface State {
  showFAQ: boolean;
}

export class RewardsModal extends React.Component<Properties, State> {
  state = {
    showFAQ: false,
  };

  publishIfClosing = (open: boolean) => {
    if (!open) {
      this.props.onClose();
    }
  };

  openFAQ = () => this.setState({ showFAQ: true });
  closeFAQ = () => this.setState({ showFAQ: false });

  renderFAQ() {
    return (
      <div {...cn('faq-content')}>
        <Faq onBack={this.closeFAQ} />
      </div>
    );
  }

  renderModalContent() {
    return (
      <div {...cn('main-content')}>
        <div {...cn('background')}>
          <svg xmlns='http://www.w3.org/2000/svg' width='390' height='208' viewBox='0 0 390 208' fill='none'>
            <path
              opacity='0.25'
              d='M176.623 90.2423C195.444 101.897 218.216 101.338 233.091 89.4693C241.929 82.4169 245.958 72.9859 247.805 65.8086M303.844 110.074C303.844 36.0289 243.681 -24 169.471 -24C95.2614 -24 35.0985 36.023 35.0985 110.074C35.0985 126.652 38.1141 142.535 43.6328 157.193M268.146 201.077C274.993 193.692 281.013 185.539 286.067 176.757M236.81 170.013L195.193 128.496L153.583 170.013M148.142 175.442L145.43 178.148C159.382 188.328 176.581 194.34 195.193 194.34C213.806 194.34 231.005 188.328 244.957 178.148L242.245 175.442M257.102 155.522L327.325 207M397 109.901L264.433 110.145C264.433 125.451 259.445 139.597 250.994 151.05L253.95 153.215M195.193 106.369V113.921M191.409 110.145H198.984M256.077 63.4062C266.066 76.3396 272.008 92.5495 272.008 110.145C272.008 141.786 252.794 168.943 225.373 180.646L227.28 183.94M163.112 183.934L165.019 180.64C137.599 168.937 118.385 141.78 118.385 110.139C118.385 67.8125 152.772 33.5017 195.193 33.5017C212.703 33.5017 228.848 39.347 241.768 49.1943M-21 10.1383L132.366 81.0789C128.254 89.9153 125.96 99.7625 125.96 110.145C125.96 131.005 135.221 149.7 149.87 162.366L147.188 165.042M141.818 170.4L119.97 192.199M170.318 85.0749L129.44 44.2944M111.287 99.1203L114.648 99.5663M107.586 110.145H113.957M111.287 121.164L114.648 120.724M110.572 132.765L116.722 131.124M116.996 142.464L120.137 141.161M119.327 153.851L124.839 150.676M128.743 161.022L130.745 159.488M231.458 108.92L216.243 73.9432M196.534 133.586L195.193 132.04L193.858 133.586H196.534ZM196.534 137.148L195.193 135.602L193.858 137.148H196.534ZM121.174 195.089C121.174 197.349 119.338 199.18 117.074 199.18C114.809 199.18 112.974 197.349 112.974 195.089C112.974 192.83 114.809 190.998 117.074 190.998C119.338 190.998 121.174 192.83 121.174 195.089ZM259.498 55.8365C259.498 61.4096 254.97 65.9275 249.385 65.9275C243.799 65.9275 239.271 61.4096 239.271 55.8365C239.271 50.2633 243.799 45.7454 249.385 45.7454C254.97 45.7454 259.498 50.2633 259.498 55.8365ZM177.32 87.9708C177.32 90.2303 175.485 92.0619 173.22 92.0619C170.956 92.0619 169.12 90.2303 169.12 87.9708C169.12 85.7113 170.956 83.8797 173.22 83.8797C175.485 83.8797 177.32 85.7113 177.32 87.9708ZM71.0511 123.621V122.348H72.3265V123.621H71.0511ZM72.8733 121.801V120.528H74.1487V121.801H72.8733ZM71.0496 119.983V118.71H72.325V119.983H71.0496ZM74.697 123.619V122.347H75.9723V123.619H74.697ZM76.5193 121.805V120.533H77.7946V121.805H76.5193ZM69.2274 121.802V120.53H70.5028V121.802H69.2274ZM74.6956 119.981V118.709H75.971V119.981H74.6956ZM25.0207 34.1618L23.0421 34.6613L23.8228 36.5463L25.0207 34.1618ZM28.2151 35.7614L26.2305 36.2609L27.0172 38.1459L28.2151 35.7614ZM234.962 111.215C234.962 109.833 233.839 108.712 232.453 108.712C231.068 108.712 229.944 109.833 229.944 111.215C229.944 112.598 231.068 113.719 232.453 113.719C233.839 113.719 234.962 112.598 234.962 111.215ZM215.373 74.8114H217.119V73.0691H215.373V74.8114Z'
              stroke='#EEECFF'
              strokeOpacity='0.42'
            />
          </svg>
          <div {...cn('blob')} />
        </div>
        <div {...cn('content')}>
          <div {...cn('title-bar')}>
            <h3 {...cn('title')}>Income</h3>
            <IconButton {...cn('close')} size='large' Icon={IconXClose} onClick={this.props.onClose} />
          </div>

          <div {...cn('body')}>
            <ZeroSymbol height={32} width={32} />

            <div {...cn('rewards')}>
              <div {...cn('usd')}>{this.props.totalUSD}</div>
              <div {...cn('meow')}>{this.props.totalMeow}</div>
            </div>
          </div>

          <div {...cn('footer')}>
            <span>
              Earn by messaging, inviting friends, and when those you invited mint a Domain or invite their friends.
            </span>
            <span {...cn('learn-more')} onClick={this.openFAQ}>
              &nbsp;More <IconArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Modal {...cn('')} open={true} onOpenChange={this.publishIfClosing}>
        <div {...cn('slide-container', this.state.showFAQ && 'faq')}>
          {this.renderModalContent()}
          {this.renderFAQ()}
        </div>
      </Modal>
    );
  }
}
