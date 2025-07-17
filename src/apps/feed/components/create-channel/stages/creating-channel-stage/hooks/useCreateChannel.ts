import { useState, useCallback } from 'react';

interface CreateChannelParams {
  zid: string;
  network: string;
  tokenAddress: string;
  tokenAmount: string;
  tokenSymbol: string;
}

interface CreateChannelResponse {
  success: boolean;
  channelId?: string;
  roomId?: string;
  zid?: string;
  tokenGatingSettings?: any;
  message?: string;
}

export const useCreateChannel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChannel = useCallback(async (params: CreateChannelParams): Promise<CreateChannelResponse> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/channels/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsCreating(false);
        return data;
      } else {
        const errorMessage = data.message || 'Failed to create channel';
        setError(errorMessage);
        setIsCreating(false);
        return { success: false, message: errorMessage };
      }
    } catch (err) {
      const errorMessage = 'Network error occurred';
      setError(errorMessage);
      setIsCreating(false);
      return { success: false, message: errorMessage };
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsCreating(false);
  }, []);

  return {
    createChannel,
    isCreating,
    error,
    reset,
  };
};
