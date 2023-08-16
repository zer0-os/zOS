import React from 'react';
import { shallow } from 'enzyme';
import { RequestPasswordResetErrors, RequestPasswordResetStage } from '../../store/request-password-reset';
import { RootState } from '../../store/reducer';
import { Container, Properties } from './container';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      stage: RequestPasswordResetStage.SubmitEmail,
      isLoading: false,
      errors: {},
      requestPasswordReset: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', function () {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find('RequestPasswordReset').props()).toEqual(
      expect.objectContaining({
        isLoading: true,
      })
    );
  });

  describe('mapState', () => {
    const subject = (requestPasswordReset) => {
      const state = {
        requestPasswordReset: {
          stage: RequestPasswordResetStage.SubmitEmail,
          loading: false,
          errors: [],
          ...requestPasswordReset,
        },
      } as RootState;

      return Container.mapState(state);
    };

    it('isLoading', () => {
      const props = subject({ loading: true });

      expect(props.isLoading).toEqual(true);
    });

    describe('email errors', () => {
      it('email is required', () => {
        const props = subject({ errors: [RequestPasswordResetErrors.EMAIL_REQUIRED] });

        expect(props.errors).toEqual({ email: 'Email is required' });
      });
    });

    describe('general errors', () => {
      it('unknown error', () => {
        const props = subject({ errors: [RequestPasswordResetErrors.UNKNOWN_ERROR] });

        expect(props.errors).toEqual({ email: 'Something went wrong. Please try again.' });
      });

      it('other unknown errors', () => {
        const props = subject({ errors: ['random_error'] });

        expect(props.errors).toEqual({ general: 'Something went wrong. Please try again.' });
      });
    });
  });
});
