/**
 * A feature is a capability that can change the app's relationship with the zOS.
 */
export type ZAppFeatureType = 'fullscreen';

interface Feature {
  type: ZAppFeatureType;
}

/**
 * Changes the AppBar to be on top of the iframe instead of on the side of the iframe
 */
interface FullScreenFeature extends Feature {
  type: 'fullscreen';
}

type ZAppFeature = FullScreenFeature;

export type { ZAppFeature };

export type ExtractFeatureType<T extends ZAppFeatureType> = T extends 'fullscreen' ? FullScreenFeature : never;
