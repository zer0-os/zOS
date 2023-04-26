import React from 'react';

import { shallow } from 'enzyme';

import { Container, Properties } from './container';
import { ProfileDetailsErrors, RegistrationState } from '../../store/registration';
import { RootState } from '../../store/reducer';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      updateProfile: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find('CreateAccountDetails').props()).toEqual(
      expect.objectContaining({
        isLoading: true,
      })
    );
  });

  describe('mapState', () => {
    const subject = (registrationState: Partial<RegistrationState> = {}) => {
      const state = {
        registration: {
          loading: false,
          errors: [],
          ...registrationState,
        },
      } as RootState;
      return Container.mapState(state);
    };

    it('isLoading', () => {
      const props = subject({ loading: true });

      expect(props.isLoading).toEqual(true);
    });

    describe('name errors', () => {
      it('empty name', () => {
        const props = subject({ errors: [ProfileDetailsErrors.NAME_REQUIRED] });

        expect(props.errors).toEqual({ name: 'Name is required' });
      });
    });

    describe('general errors', () => {
      it('unknown error', () => {
        const props = subject({ errors: ['random_error'] });

        expect(props.errors).toEqual({ general: 'An error has occurred' });
      });
    });
  });
});
