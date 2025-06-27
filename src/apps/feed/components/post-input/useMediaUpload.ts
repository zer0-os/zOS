import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadMedia as uploadMediaApi } from '../../../../store/posts/media-api';

export const useMediaUpload = () => {
  const [uploadedMediaId, setUploadedMediaId] = useState<string | undefined>();

  const { mutate, isPending } = useMutation({
    mutationFn: (file: File) => uploadMediaApi(file),
    onMutate: () => {
      setUploadedMediaId(undefined);
    },
    onSuccess: (data) => {
      setUploadedMediaId(data.id);
    },
    onError: (error) => {
      console.error('Error uploading media:', error);
      setUploadedMediaId(undefined);
    },
  });

  return {
    uploadMedia: mutate,
    uploadedMediaId,
    removeUploadedMedia: () => setUploadedMediaId(undefined),
    isPending,
  };
};
