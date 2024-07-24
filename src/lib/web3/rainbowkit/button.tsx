import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Variant } from '@zero-tech/zui/components/Button';
import { IconChevronRight } from '@zero-tech/zui/components/Icons/icons/IconChevronRight';

interface RainbowKitConnectButtonProperties {
  isDisabled?: boolean;
}

export const RainbowKitConnectButton = ({ isDisabled }: RainbowKitConnectButtonProperties) => {
  return (
    <ConnectButton.Custom>
      {({ account, openAccountModal, openConnectModal }) => {
        if (account?.address) {
          return (
            <Button
              isDisabled={isDisabled}
              variant={Variant.Secondary}
              onPress={openAccountModal}
              endEnhancer={<IconChevronRight isFilled={true} />}
            >
              {account.displayName}
            </Button>
          );
        } else {
          return (
            <Button isDisabled={isDisabled} onPress={openConnectModal}>
              Connect Wallet
            </Button>
          );
        }
      }}
    </ConnectButton.Custom>
  );
};
