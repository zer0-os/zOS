import { CloudinaryProvider } from '@zer0-os/zos-component-library';
import { config } from '../../config';

export const provider = new CloudinaryProvider({
  cloud_name: config.cloudinary.cloud_name,
  max_file_size: config.cloudinary.max_file_size,
});
