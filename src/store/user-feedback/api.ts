//import { post } from '../../lib/api/rest';

export async function submitUserFeedback(feedback: string) {
  console.log('submitting [ in saga ]: ', feedback);
  // const response = await post('/api/v2/users/feedback').send({ feedback });
  // return {
  //   success: response.status === 200,
  // };
}
