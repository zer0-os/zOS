import { ZAppFeature } from './features';

/**
 * The manifest is a JSON object that describes the app.
 * It is used to provide information about the app to the zOS.
 *
 * For now, it'll just include features that the app supports. In the future,
 * it'll include other information like the name, description, version, url, auth scopes, etc.
 */
type ZAppManifest = {
  name: string;
  features: ZAppFeature[];
};

export type { ZAppManifest };
