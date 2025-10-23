import { post } from '../../lib/api/rest';
import { User } from '../channels';
import { rawUserToDomainUser } from './utils';

export async function getZEROUsers(matrixIds?: string[], userIds?: string[]): Promise<User[]> {
  try {
    const response = await post('/matrix/users/zero').send({
      matrixIds,
      userIds,
    });

    if (!response?.body) {
      return [];
    }

    return response.body.map(rawUserToDomainUser);
  } catch (error) {
    return [];
  }
}
