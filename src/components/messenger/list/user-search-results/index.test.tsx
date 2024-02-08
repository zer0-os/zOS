import React from 'react';
import { shallow } from 'enzyme';

import { UserSearchResults, Properties } from '.';
import { Avatar } from '@zero-tech/zui/components';

import { bem } from '../../../../lib/bem';

const c = bem('.user-search-results');

describe('UserSearchResults', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      filter: '',
      results: [],
      onCreate: () => null,
      ...props,
    };

    return shallow(<UserSearchResults {...allProps} />);
  };

  it('renders the title', function () {
    const wrapper = subject({});

    expect(wrapper.find(c('title'))).toHaveText('Start a new conversation:');
  });

  it('renders user search results', function () {
    const userResults = [
      { value: 'user-1', label: 'jack', image: 'image-1', subLabel: '0://jack.test' },
      { value: 'user-2', label: 'bob', image: 'image-2', subLabel: '0://bob.test' },
      { value: 'user-3', label: 'jacklyn', image: 'image-3', subLabel: '0x1234...3456' },
    ];
    const wrapper = subject({ results: userResults });

    const renderedResults = wrapper.find(c('item'));
    expect(renderedResults).toHaveLength(userResults.length);

    renderedResults.forEach((node, index) => {
      expect(node.key()).toEqual(userResults[index].value);
      expect(node.find(Avatar)).toHaveProp('imageURL', userResults[index].image);
      expect(node.find(c('label'))).toHaveText(userResults[index].label);
      expect(node.find(c('sub-label'))).toHaveText(userResults[index].subLabel);
    });
  });

  it('should render sublabel if it is available', function () {
    const userResults = [
      { value: 'user-1', label: 'jack', image: 'image-1', subLabel: '0://jack.test' },
    ];
    const wrapper = subject({ results: userResults });

    expect(wrapper).toHaveElement(c('sub-label'));
  });

  it('should not render sublabel if it is not available', function () {
    const userResults = [
      { value: 'user-1', label: 'jack', image: 'image-1' },
    ];
    const wrapper = subject({ results: userResults });

    expect(wrapper).not.toHaveElement(c('sub-label'));
  });

  it('triggers onCreate when a user is clicked', function () {
    const handleCreate = jest.fn();
    const userResults = [
      { value: 'user-1', label: 'jack', image: 'image-1' },
    ];
    const wrapper = subject({ results: userResults, onCreate: handleCreate });

    wrapper.find(c('item')).simulate('click');

    expect(handleCreate).toHaveBeenCalledWith(userResults[0].value);
  });

  it('triggers onCreate when enter key is pressed', function () {
    const handleCreate = jest.fn();
    const userResults = [
      { value: 'user-1', label: 'jack', image: 'image-1' },
    ];
    const wrapper = subject({ results: userResults, onCreate: handleCreate });

    wrapper.find(c('item')).simulate('keydown', { key: 'Enter' });

    expect(handleCreate).toHaveBeenCalledWith(userResults[0].value);
  });
});
