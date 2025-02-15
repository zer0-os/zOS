import * as React from 'react';

import './styles.scss';

export interface Properties {
  className?: string;
  children: React.ReactNode;
  variant?: 'on-hover' | 'fixed';
  hasPanel?: boolean;
  isScrollbarHidden?: boolean;
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

  scrollToTop() {
    this.scrollContainerRef.current.scrollTop = 0;
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
    const { children, variant = 'fixed', hasPanel, className } = this.props;
    const { showPanel } = this.state;

    return (
      <div className={`scrollbar-container ${className}`}>
        <div
          className='scrollbar-container__content'
          data-variant={variant}
          ref={this.scrollContainerRef}
          data-is-scrollbar-hidden={this.props.isScrollbarHidden}
        >
          {children}
        </div>
        {variant === 'on-hover' && showPanel && hasPanel && <div className='scrollbar-container__panel'></div>}
      </div>
    );
  }
}
