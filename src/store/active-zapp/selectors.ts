import { RootState } from '../reducer';
import { createSelector } from 'reselect';
import { ZAppFeatureType, ExtractFeatureType } from '../../apps/external-app/types/features';

export const rawActiveZAppManifest = (state: RootState) => state.activeZApp.manifest;

export const activeZAppManifestSelector = createSelector([rawActiveZAppManifest], (manifest) => manifest);
export const activeZAppFeaturesSelector = createSelector([rawActiveZAppManifest], (manifest) => manifest?.features);

export const activeZAppFeatureSelector =
  <T extends ZAppFeatureType>(featureType: T) =>
  (state: RootState): ExtractFeatureType<T> | undefined => {
    const features = activeZAppFeaturesSelector(state);
    return features?.find((feature) => feature.type === featureType) as ExtractFeatureType<T> | undefined;
  };
