import { getUserSubHandle, highlightFilter } from './utils';

describe('highlightFilter', () => {
  it('returns unmodified text when filter is an empty string', () => {
    const text = 'Hello World';
    const filter = '';

    const result = highlightFilter(text, filter);

    expect(result).toEqual(text);
  });

  it('returns unmodified text when text is not provided', () => {
    const text = null;
    const filter = 'world';

    const result = highlightFilter(null, filter);

    expect(result).toEqual(text);
  });

  it('returns highlighted text when filter matches text', () => {
    const text = 'Hello World';
    const filter = 'World';

    const result = highlightFilter(text, filter);

    expect(result.length).toEqual(3);
    expect(result[0]).toEqual('Hello ');
    expect(result[1].type).toEqual('span');
    expect(result[1].props.children).toEqual(filter);
    expect(result[2]).toEqual('');
  });

  it('returns highlighted text when filter matches text ignoring case', () => {
    const text = 'Hello World';
    const filter = 'world';

    const result = highlightFilter(text, filter);

    expect(result.length).toEqual(3);
    expect(result[0]).toEqual('Hello ');
    expect(result[1].type).toEqual('span');
    expect(result[1].props.children).toEqual('World');
    expect(result[2]).toEqual('');
  });

  it('returns highlighted text when filter partially matches text', () => {
    const text = 'Hello World';
    const filter = 'lo';

    const result = highlightFilter(text, filter);

    expect(result.length).toEqual(3);
    expect(result[0]).toEqual('Hel');
    expect(result[1].type).toEqual('span');
    expect(result[1].props.children).toEqual('lo');
    expect(result[2]).toEqual(' World');
  });
});

describe('getUserSubHandle', () => {
  it('returns primaryZID when it is present', () => {
    const user = { primaryZID: 'zid123', primaryWallet: { id: 'wallet-id-1', publicAddress: 'address456' } };
    expect(getUserSubHandle(user.primaryZID, user.primaryWallet.publicAddress)).toEqual('zid123');
  });

  it('returns truncated publicAddress from the first wallet when primaryZID is absent', () => {
    const user = { primaryZID: null, primaryWallet: { id: 'wallet-id-1', publicAddress: '0x123456789' } };
    expect(getUserSubHandle(user.primaryZID, user.primaryWallet.publicAddress)).toEqual('0x1234...6789');
  });

  it('returns empty string when both primaryZID and wallets are absent', () => {
    const user = { primaryZID: null, primaryWallet: null };
    expect(getUserSubHandle(user.primaryZID, user.primaryWallet)).toEqual('');
  });
});
