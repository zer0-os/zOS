import React from 'react';
import { connect, ConnectedComponent } from 'react-redux';
import { RootState } from './reducer';

// XXX
// interface IContainerComponent<TPublicProps, TContainerProps> {
interface IContainerComponent<TPublicProps, TContainerProps> {
  new (props: TContainerProps): React.Component<TContainerProps>;
  mapState(state: RootState, props?: TPublicProps): Partial<TContainerProps>;
  mapActions(props?: TPublicProps): Partial<TContainerProps>;
}

// XXX type IConnectorComponent<TPublicProps> = new () => React.Component<TPublicProps>;

interface IDispatchActions {
  [key: string]: (...args) => void;
}

// XXX
// export function connectContainer<TPublicProps, TContainerProps>(containerComponent: IContainerComponent<TPublicProps, TContainerProps>): IConnectorComponent<TPublicProps> {
export function connectContainer<TPublicProps>(
  containerComponent: IContainerComponent<TPublicProps, any>
): ConnectedComponent<any, TPublicProps> {
  function mapStateToProps(state: RootState, props: TPublicProps) {
    return containerComponent.mapState(state, props);
  }

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
