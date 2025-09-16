import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../../../lib/api/rest';

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
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a valid image file (JPG, PNG, GIF, WEBP)');
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const formData = new FormData();
      formData.append('icon', file);

      const response = await post('/api/zbanc/upload-icon').attach('icon', file);

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to upload icon') as Error & { code?: string };
        error.code = errorData.error;
        throw error;
      }

      return response.body;
    },
    onSuccess: () => {
      // Invalidate any cached data that might include token icons
      queryClient.invalidateQueries({ queryKey: ['zbanc-tokens'] });
    },
  });
};
