import { displayName } from './user';

import { User } from '../store/channels';

describe('User Lib', () => {
  describe(displayName, () => {
    it('returns first and last name concatenated', () => {
      expect(displayName({ firstName: 'John', lastName: 'Doe' } as User)).toEqual('John Doe');
    });

    it('returns just first name', () => {
      expect(displayName({ firstName: 'John' } as User)).toEqual('John');
    });

    it('returns just last name', () => {
      expect(displayName({ lastName: 'Doe' } as User)).toEqual('Doe');
    });

    it('returns "Unknown" if neither is known', () => {
      expect(displayName({} as User)).toEqual('Unknown');
    });

    it('returns "Unknown" if user is not found', () => {
      expect(displayName(null)).toEqual('Unknown');
    });
  });
});
