import { get } from '../../lib/api/rest';

export async function checkServerStatus(): Promise<{ isInMaintenance: boolean }> {
  try {
    await get('/');
    return {
      isInMaintenance: false,
    };
  } catch (error: any) {
    // Check if the error is a 503 with Maintenance reason
    if (error?.response?.status === 503 && error?.response?.body?.reason === 'Maintenance') {
      return {
        isInMaintenance: true,
      };
    }

    // For other errors, we don't assume maintenance mode
    console.error('Failed to check server status:', error);
    return {
      isInMaintenance: false,
    };
  }
}
