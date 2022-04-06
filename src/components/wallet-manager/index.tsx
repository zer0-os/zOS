import React, { useEffect, useState, VFC } from 'react';
import {
  EthAddress,
  Button,
  WalletSelectModal,
  WalletType,
} from '@zer0-os/zos-component-library';

import { RootState } from '../../store';
import { updateConnector } from '../../store/web3';
import { ConnectionStatus, Connectors } from '../../lib/web3';

import './styles.scss';
import { connect } from 'react-redux';

export interface Props {
  currentAddress: string;
  currentConnector: Connectors;
  connectionStatus: ConnectionStatus;
  updateConnector: (connector: WalletType) => void;
}

export const Container: VFC<Props> = ({
  currentAddress,
  connectionStatus,
  currentConnector,
  updateConnector,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [walletSelected, setWalletSelected] = useState(false);
  const [isConnecting, setConnecting] = useState(false);

  useEffect(() => {
    if (connectionStatus === ConnectionStatus.Connecting) {
      setConnecting(true);
      closeModal();
    }
  }, [connectionStatus]);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const showButton = !(
    connectionStatus === ConnectionStatus.Connected &&
    currentConnector === Connectors.Metamask
  );
  console.log('currentConnector--->', currentConnector);
  // const isConnecting =
  //   walletSelected || connectionStatus === ConnectionStatus.Connecting;
  console.log('isOcnnectin', isConnecting);
  const availableWallets = [WalletType.Metamask];

  const handleWalletSelected = (connector: WalletType): void => {
    setWalletSelected(true);
    updateConnector(connector);
  };

  return (
    <div className='wallet-manager'>
      {currentAddress && <EthAddress address={currentAddress} />}
      {showButton && (
        <Button
          data-testid="custom-element"
          className='wallet-manager__connect-button'
          label='Connect'
          onClick={openModal}
        />
      )}
      {showModal && (
        <WalletSelectModal
          wallets={availableWallets}
          isConnecting={isConnecting}
          onClose={closeModal}
          onSelect={handleWalletSelected}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState): Partial<Props> => {
  const {
    web3: { status, value },
  } = state;

  return {
    currentConnector: value.connector,
    currentAddress: value.address,
    connectionStatus: status,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateConnector: (connector: WalletType) =>
      dispatch(updateConnector(connector)),
  };
};

export const WalletManager = connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);

// export class Container extends React.Component<Props, State> {
//   static mapState(state: RootState): Partial<Props> {
//     const {
//       web3: { status, value },
//     } = state;

//     return {
//       currentConnector: value.connector,
//       currentAddress: value.address,
//       connectionStatus: status,
//     };
//   }

//   static mapActions(_props: Props): Partial<Props> {
//     return {
//       updateConnector,
//     };
//   }

//   state = { showModal: false, walletSelected: false };

//   componentDidUpdate(prevProps: Props) {
//     if (
//       this.props.connectionStatus === ConnectionStatus.Connected &&
//       prevProps.connectionStatus !== ConnectionStatus.Connected
//     ) {
//       this.closeModal();
//       this.setState({ walletSelected: false });
//     }
//   }

//   get showButton() {
//     return !(
//       this.props.connectionStatus === ConnectionStatus.Connected &&
//       this.props.currentConnector === Connectors.Metamask
//     );
//   }

//   get showModal() {
//     return this.state.showModal;
//   }

//   get isConnecting() {
//     return (
//       this.state.walletSelected ||
//       this.props.connectionStatus === ConnectionStatus.Connecting
//     );
//   }

//   get availableWallets() {
//     return [
//       WalletType.Metamask,
//       WalletType.WalletConnect,
//       WalletType.Coinbase,
//       WalletType.Fortmatic,
//       WalletType.Portis,
//     ];
//   }

//   openModal = () => this.setState({ showModal: true });
//   closeModal = () => this.setState({ showModal: false });

//   handleWalletSelected = (connector: WalletType) => {
//     this.setState({ walletSelected: true });
//     this.props.updateConnector(connector);
//   };

//   render() {
//     return (
//       <div className='wallet-manager'>
//         {this.props.currentAddress && (
//           <EthAddress address={this.props.currentAddress} />
//         )}
//         {this.showButton && (
//           <Button
//             className='wallet-manager__connect-button'
//             label='Connect'
//             onClick={this.openModal}
//           />
//         )}
//         {this.showModal && (
//           <WalletSelectModal
//             wallets={this.availableWallets}
//             isConnecting={this.isConnecting}
//             onClose={this.closeModal}
//             onSelect={this.handleWalletSelected}
//           />
//         )}
//       </div>
//     );
//   }
// }

// export const WalletManager = connectContainer<{}>(Container);
