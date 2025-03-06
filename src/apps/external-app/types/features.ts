/**
 * A feature is a capability that can change the app's relationship with the zOS.
 */
interface Feature {
  type: string;
}

/**
 * Changes the AppBar to be on top of the iframe instead of on the side of the iframe
 */
interface FullScreenFeature extends Feature {
  type: 'fullscreen';
}

type ZAppFeature = FullScreenFeature;

export type { ZAppFeature };
