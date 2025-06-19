import { Provider, ProviderLabels, ProviderLogos } from '../types/providers';
import { IconXClose } from '@zero-tech/zui/icons';
import styles from './linked-account.module.scss';

interface Properties {
  provider: Provider;
  providerUserId: string;
  handle: string;
  onUnlink: (provider: Provider, providerUserId: string) => void;
}

export function LinkedAccount({ provider, providerUserId, handle, onUnlink }: Properties) {
  const handleRemove = () => {
    onUnlink(provider, providerUserId);
  };

  return (
    <>
      <div className={styles.accountItem}>
        <img className={styles.providerLogo} src={ProviderLogos[provider]} alt={provider} />
        <div className={styles.accountDetails}>
          <span className={styles.providerName}>{ProviderLabels[provider]}</span>
          <span className={styles.accountHandle}>{handle}</span>
        </div>
        <div className={styles.closeIconContainer} onClick={handleRemove}>
          <IconXClose className={styles.closeIcon} size={24} />
        </div>
      </div>
    </>
  );
}
