import React, { useEffect, useState, VFC, useCallback } from 'react';
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

const availableWallets = [
  WalletType.Metamask,
  WalletType.WalletConnect,
  WalletType.Coinbase,
  WalletType.Fortmatic,
  WalletType.Portis,
];

export const Container: VFC<Props> = ({
  currentAddress,
  connectionStatus,
  currentConnector,
  updateConnector,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [walletSelected, setWalletSelected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);
  const closeModal = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    if (connectionStatus === ConnectionStatus.Connecting) {
      setWalletSelected(false);
    }

    if (connectionStatus === ConnectionStatus.Disconnected) {
      setWalletSelected(false);
      setIsConnecting(false);
    }
  }, [closeModal, connectionStatus]);

  useEffect(() => {
    if (walletSelected || connectionStatus === ConnectionStatus.Connecting) {
      setIsConnecting(true);
    }
  }, [connectionStatus, walletSelected]);

  useEffect(() => {
    setShowButton(
      !(
        connectionStatus === ConnectionStatus.Connected &&
        currentConnector === Connectors.Metamask
      )
    );
  }, [connectionStatus, currentConnector]);

  const handleWalletSelected = useCallback(
    (connector: WalletType): void => {
      setWalletSelected(true);
      updateConnector(connector);
    },
    [updateConnector]
  );

  return (
    <div className='wallet-manager'>
      {currentAddress && (
        <div data-testid='eth-address'>
          <EthAddress address={currentAddress} />
        </div>
      )}
      {showButton && (
        <Button
          data-testid='connect-button'
          className='wallet-manager__connect-button'
          label='Connect'
          onClick={openModal}
        />
      )}
      {showModal && (
        <div>
          <WalletSelectModal
            wallets={availableWallets}
            isConnecting={isConnecting}
            onClose={closeModal}
            onSelect={handleWalletSelected}
          />
        </div>
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
