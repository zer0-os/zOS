import { useProviderHandler } from '../hooks/useProviderHandler';
import { Provider, ProviderLabels, ProviderLogos } from '../types/providers';
import styles from './available-account.module.scss';

interface Properties {
  provider: Provider;
}

export function AvailableAccount({ provider }: Properties) {
  const handleProviderLink = useProviderHandler();

  return (
    <div className={styles.container} onClick={() => handleProviderLink(provider)}>
      <img className={styles.providerLogo} src={ProviderLogos[provider]} alt={provider} />
      <h4 className={styles.providerName}>{ProviderLabels[provider]}</h4>
    </div>
  );
}
