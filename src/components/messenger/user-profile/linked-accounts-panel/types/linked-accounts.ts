import { Provider } from './providers';

export interface LinkedAccountType {
  provider: Provider;
  providerUserId: string;
  handle: string;
}
