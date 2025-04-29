import React from 'react';
import { connect, ConnectedComponent } from 'react-redux';
import { RootState } from './reducer';

interface IContainerComponent<TPublicProps, TContainerProps> {
  new (props: TContainerProps): React.Component<TContainerProps>;
  mapState(state: RootState, props?: TPublicProps): Partial<TContainerProps>;
  mapActions(props?: TPublicProps): Partial<TContainerProps>;
}

interface IDispatchActions {
  [key: string]: (...args) => void;
}

export function connectContainer<TPublicProps>(
  containerComponent: IContainerComponent<TPublicProps, any>
): ConnectedComponent<any, TPublicProps> {
  // eslint-disable-next-line react-redux/mapStateToProps-prefer-parameters-names
  function mapStateToProps(state: RootState, props: TPublicProps) {
    return containerComponent.mapState(state, props);
  }

  // eslint-disable-next-line react-redux/mapDispatchToProps-prefer-parameters-names
  function mapDispatchToProps(dispatch: (action: any) => void, props: TPublicProps) {
    const actions = containerComponent.mapActions(props) as any;

    const dispatchActions: IDispatchActions = {};
    Object.keys(actions).forEach((k) => {
      dispatchActions[k] = (...args) => dispatch(actions[k](...args));
    });

    return dispatchActions;
  }

  return connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(containerComponent);
}
