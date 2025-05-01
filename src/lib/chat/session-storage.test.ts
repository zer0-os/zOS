import { SessionStorage } from './session-storage';

const setItem = jest.fn();
const getItem = jest.fn();
const removeItem = jest.fn();

describe('session storage', () => {
  const subject = (mockLocalStorage = {}) => {
    return new SessionStorage({
      getItem,
      setItem,
      removeItem,
      ...mockLocalStorage,
    } as any);
  };

  it('sets localStorage vars', async () => {
    const matrixSession = {
      deviceId: 'abc123',
      userId: '@bob:zos-matrix',
    };

    const client = subject();

    client.set(matrixSession);

    expect(setItem).toHaveBeenCalledWith('mxz_device_id', 'abc123');
    expect(setItem).toHaveBeenCalledWith('mxz_user_id', '@bob:zos-matrix');
  });

  it('removes localStorage vars on clear', async () => {
    const getItem = jest.fn((key) => (key === 'mxz_device_id' ? 'abc123' : ''));
    const client = subject({ getItem });

    client.clear();

    expect(removeItem).toHaveBeenCalledWith('mxz_device_id');
    expect(removeItem).toHaveBeenCalledWith('mxz_user_id');
  });

  it('gets from localStorage vars', async () => {
    const matrixSession = {
      deviceId: 'abc123',
      userId: '@bob:zos-matrix',
    };

    const getItem = jest.fn((key) => {
      return {
        mxz_device_id: 'abc123',
        mxz_user_id: '@bob:zos-matrix',
      }[key];
    });

    const client = subject({ getItem });

    expect(client.get()).toEqual(matrixSession);
  });

  it('returns null if deviceId is not set', async () => {
    const getItem = jest.fn((key) => {
      return {
        mxz_device_id: '',
        mxz_user_id: '@bob:zos-matrix',
      }[key];
    });

    const client = subject({ getItem });

    expect(client.get()).toBeNull();
  });
});
