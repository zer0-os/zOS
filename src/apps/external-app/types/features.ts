/**
 * A feature is a capability that can change the app's relationship with the zOS.
 */
export type ZAppFeatureType = 'fullscreen' | 'microphone';

interface Feature {
  type: ZAppFeatureType;
}

/**
 * Changes the AppBar to be on top of the iframe instead of on the side of the iframe
 */
interface FullScreenFeature extends Feature {
  type: 'fullscreen';
}

interface MicrophoneFeature extends Feature {
  type: 'microphone';
}

type ZAppFeature = FullScreenFeature | MicrophoneFeature;

export type { ZAppFeature };

export type ExtractFeatureType<T extends ZAppFeatureType> = T extends 'fullscreen'
  ? FullScreenFeature
  : T extends 'microphone'
  ? MicrophoneFeature
  : never;
