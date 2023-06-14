import * as React from 'react';

import './styles.scss';

export interface Properties {
  children: React.ReactNode;
  variant?: 'on-hover' | 'fixed';
}

interface State {
  showPanel: boolean;
}

export class ScrollbarContainer extends React.Component<Properties, State> {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  constructor(props: Properties) {
    super(props);
    this.state = {
      showPanel: true,
    };
    this.scrollContainerRef = React.createRef();
    this.checkScrollBottom = this.checkScrollBottom.bind(this);
  }

  componentDidMount() {
    const { variant } = this.props;
    if (variant === 'on-hover') {
      const currentRef = this.scrollContainerRef.current;
      if (currentRef) {
        currentRef.addEventListener('scroll', this.checkScrollBottom);
      }
    }
  }

  componentDidUpdate(prevProps: Properties) {
    if (prevProps.variant !== this.props.variant) {
      const { variant } = this.props;
      const currentRef = this.scrollContainerRef.current;
      if (currentRef) {
        if (variant === 'on-hover') {
          currentRef.addEventListener('scroll', this.checkScrollBottom);
        } else {
          currentRef.removeEventListener('scroll', this.checkScrollBottom);
        }
      }
    }
  }

  componentWillUnmount() {
    const { variant } = this.props;
    if (variant === 'on-hover') {
      const currentRef = this.scrollContainerRef.current;
      if (currentRef) {
        currentRef.removeEventListener('scroll', this.checkScrollBottom);
      }
    }
  }

  checkScrollBottom() {
    const { variant } = this.props;
    if (variant === 'on-hover') {
      const { scrollTop, scrollHeight, clientHeight } = this.scrollContainerRef.current;
      const atBottom = scrollHeight - scrollTop === clientHeight;
      this.setState({ showPanel: !atBottom });
    }
  }

  render() {
    const { children, variant = 'fixed' } = this.props;
    const { showPanel } = this.state;

    return (
      <div className='scrollbar-container'>
        <div className='scrollbar-container__content' data-variant={variant} ref={this.scrollContainerRef}>
          {children}
        </div>
        {variant === 'on-hover' && showPanel && <div className='scrollbar-container__panel'></div>}
      </div>
    );
  }
}
