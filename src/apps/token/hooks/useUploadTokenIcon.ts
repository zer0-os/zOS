import { useMutation, useQueryClient } from '@tanstack/react-query';
import { get } from '../../../lib/api/rest';
import axios from 'axios';

interface TokenIconUploadInfo {
  signedUrl: string;
  key: string;
}

interface UploadTokenIconResponse {
  success: boolean;
  data: {
    iconUrl: string;
  };
}

interface UploadTokenIconError {
  message: string;
  code?: string;
}

export const useUploadTokenIcon = () => {
  const queryClient = useQueryClient();

  return useMutation<UploadTokenIconResponse, UploadTokenIconError, File>({
    mutationFn: async (file: File) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a valid image file (JPG, PNG, GIF, WEBP)');
      }

      // (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      try {
        // Get signed URL from backend
        const response = await get<{ success: boolean; data: TokenIconUploadInfo }>(
          '/api/zbanc/get-icon-upload-info',
          undefined,
          {
            name: file.name,
            type: file.type,
          }
        );

        if (!response.ok || !response.body?.success) {
          throw new Error(response.body?.data?.message || 'Failed to get upload info');
        }

        const uploadInfo = response.body.data;

        // Upload directly to S3 using signed URL
        await axios.put(uploadInfo.signedUrl, file, {
          timeout: 2 * 60 * 1000,
          headers: {
            'Content-Type': file.type,
          },
        });

        // Return the key as the icon URL
        return {
          success: true,
          data: {
            iconUrl: uploadInfo.key,
          },
        };
      } catch (error: any) {
        console.error('Failed to upload token icon:', error);
        throw new Error(error.response?.data?.message || error.message || 'Failed to upload icon');
      }
    },
    onSuccess: () => {
      // Invalidate any cached data that might include token icons
      queryClient.invalidateQueries({ queryKey: ['zbanc-tokens'] });
    },
  });
};
