import { post } from '../../lib/api/rest';

export async function reportUser({ reportedUserId, reason, comment }) {
  try {
    const response = await post('/api/v2/users/report-user').send({
      reportedUserId,
      reason,
      comment,
    });

    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: error.response.body.code,
        error: error.response.body.message,
      };
    }
    throw error;
  }
}
