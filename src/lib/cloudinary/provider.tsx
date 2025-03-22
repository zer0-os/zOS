import { CloudinaryProvider } from './cloudinaryProvider';
import { config } from '../../config';

let provider;
export function getProvider() {
  provider = provider ?? createProvider();
  return provider;
}

function createProvider() {
  return new CloudinaryProvider({
    cloud_name: config.cloudinary.cloud_name,
    max_file_size: config.cloudinary.max_file_size,
  });
}
