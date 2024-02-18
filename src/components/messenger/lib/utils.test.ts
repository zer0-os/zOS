import { highlightFilter } from './utils';

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
