import React from 'react';
import { Message as MessageModel } from '../../store/messages';

export interface PublicProperties {
  inView?: (createdAt: MessageModel['createdAt']) => void;
}

interface Properties extends MessageModel, PublicProperties {
  wrapperRef: React.RefObject<HTMLDivElement>;
}

export class Message extends React.Component<Properties> {
  messageRef: React.RefObject<HTMLDivElement>;
  observer: any;

  constructor(props) {
    super(props);

    this.messageRef = React.createRef();
  }

  componentDidMount() {
    if (typeof this.props.inView === 'function') {
      var options = {
        root: this.props.wrapperRef.current,
        rootMargin: '0px',
        threshold: 0,
      };
      this.observer = new IntersectionObserver(this.handleObserver.bind(this), options);

      this.observer.observe(this.messageRef.current);
    }
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  handleObserver(...args) {
    this.props.inView(this.props.createdAt);
    this.observer.disconnect();
  }

  render() {
    return (
      <div
        className='message'
        ref={this.messageRef}
      >
        <div className='message__body'>{this.props.message}</div>
      </div>
    );
  }
}
