import React from 'react';
import { shallow } from 'enzyme';

import { Component, Properties, ViewModes } from '.';

describe('theme-engine', () => {
  const getElement = (setProperty = (_prop: string, _value: string) => undefined) => {
    return { style: { setProperty } } as HTMLElement;
  }

  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      element: getElement(),
      viewMode: ViewModes.Light,
      theme: {},
      ...props,
    };

    return shallow(<Component {...allProps} />);
  };

  it('sets css vars based on view mode', function() {
    const setProperty = jest.fn();
    const theme = {
      dark: {
        textColor: 'red',
        backgroundColor: 'purple',
      },
      light: {
        textColor: 'white',
        backgroundColor: 'green',
      },
    };

    subject({
      element: getElement(setProperty),
      theme,
      viewMode: ViewModes.Dark,
    });


    expect(setProperty).toHaveBeenCalledWith('--text-color', 'red');
    expect(setProperty).toHaveBeenCalledWith('--background-color', 'purple');
  });

  it('sets css vars based on updated view mode', function() {
    const setProperty = jest.fn();
    const theme = {
      dark: {
        textColor: 'red',
        backgroundColor: 'purple',
      },
      light: {
        textColor: 'white',
        backgroundColor: 'green',
      },
    };

    const wrapper = subject({
      element: getElement(setProperty),
      theme,
      viewMode: ViewModes.Dark,
    });

    wrapper.setProps({ viewMode: ViewModes.Light });

    expect(setProperty).toHaveBeenCalledWith('--text-color', 'white');
    expect(setProperty).toHaveBeenCalledWith('--background-color', 'green');
  });
});
