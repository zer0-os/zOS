import React from 'react';

import { shallow } from 'enzyme';
import { Mentions, Properties } from '.';

describe(Mentions, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      id: 'mention-id',
      value: '',
      textareaRef: { current: null },

      onBlur: () => null,
      onChange: () => null,
      onKeyDown: () => null,
      getUsersForMentions: () => undefined,
      ...props,
    };

    return shallow(<Mentions {...allProps} />);
  };

  it('searches for matching users via userMentionSearch function', async function () {
    const getUsersForMentions = async (_searchString) =>
      Promise.resolve([{ id: '1', display: 'dale', profileImage: 'http://example.com' }]);
    const wrapper = subject({ getUsersForMentions });

    const searchResults = await userSearch(wrapper, 'da');

    expect(searchResults).toEqual([{ display: 'dale', id: '1', profileImage: 'http://example.com' }]);
  });

  it('sorts by search string index', async function () {
    const getUsersForMentions = async (_searchString) =>
      Promise.resolve([
        { id: 'd-2', display: '2-dale', profileImage: 'http://example.com/2', primaryZID: '0://d-2:dale' },
        { id: 'd-3', display: '3--dale', profileImage: 'http://example.com/3', primaryZID: '0://d-3:dale' },
        { id: 'd-1', display: 'dale', profileImage: 'http://example.com/', primaryZID: '0://d-1:dale' },
      ]);
    const wrapper = subject({ getUsersForMentions });

    const searchResults = await userSearch(wrapper, 'da');

    expect(searchResults).toEqual([
      { display: 'dale', id: 'd-1', profileImage: 'http://example.com/', primaryZID: '0://d-1:dale' },
      { display: '2-dale', id: 'd-2', profileImage: 'http://example.com/2', primaryZID: '0://d-2:dale' },
      { display: '3--dale', id: 'd-3', profileImage: 'http://example.com/3', primaryZID: '0://d-3:dale' },
    ]);
  });
});

async function userSearch(wrapper, search) {
  const userMentionHandler = wrapper.find('Mention').findWhere((n) => n.prop('trigger') === '@');
  let searchResults = [];
  const callback = (r) => {
    searchResults = r;
  };
  await userMentionHandler.prop('data')(search, callback);
  return searchResults;
}
