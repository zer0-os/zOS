import { RootState } from '../reducer';
import { createSelector } from 'reselect';
import { ZAppFeature, ZAppFeatureType, ExtractFeatureType } from '../../apps/external-app/types/features';

export const rawActiveZAppManifest = (state: RootState) => state.activeZApp.manifest;

export const activeZAppManifestSelector = createSelector([rawActiveZAppManifest], (manifest) => manifest);
export const activeZAppFeaturesSelector = createSelector([rawActiveZAppManifest], (manifest) => manifest?.features);

export const activeZAppFeatureSelector = <T extends ZAppFeatureType>(
  state: RootState,
  featureType: T
): ExtractFeatureType<T> | undefined => {
  const features = activeZAppFeaturesSelector(state);
  return features?.find((feature) => feature.type === featureType) as ExtractFeatureType<T> | undefined;
};
