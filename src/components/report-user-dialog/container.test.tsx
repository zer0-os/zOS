import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { ReportUserModal } from '.';
import { reportUser } from '../../store/report-user';
import { StoreBuilder } from '../../store/test/store';

describe('ReportUserContainer', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      reason: '',
      comment: '',
      reportedUserName: '',
      loading: false,
      errorMessage: '',
      successMessage: '',
      reportUser: jest.fn(),
      onClose: jest.fn(),
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders ReportUserModal with correct props', () => {
    const wrapper = subject({
      reportedUserName: 'John Doe',
      loading: true,
      errorMessage: 'Error',
      successMessage: 'Success',
    });

    expect(wrapper.find(ReportUserModal).props()).toEqual(
      expect.objectContaining({
        reportedUserName: 'John Doe',
        loading: true,
        errorMessage: 'Error',
        successMessage: 'Success',
      })
    );
  });

  it('calls reportUser on report', () => {
    const reportUserMock = jest.fn();
    const wrapper = subject({ reportUser: reportUserMock });

    const instance = wrapper.instance() as Container;
    const payload = { reason: 'Spam', comment: 'This is spam' };
    instance.report(payload);

    expect(reportUserMock).toHaveBeenCalledWith(payload);
  });

  describe('mapState', () => {
    const stateMock = new StoreBuilder()
      .withUsers({ userId: 'user-id', firstName: 'John Doe', lastName: '' })
      .withReportUser({
        reportedUserId: 'user-id',
        loading: true,
        errorMessage: 'Error',
        successMessage: 'Success',
      });

    it('maps state to props', () => {
      const props = Container.mapState(stateMock.build());

      expect(props).toEqual(
        expect.objectContaining({
          reportedUserName: 'John Doe',
          loading: true,
          errorMessage: 'Error',
          successMessage: 'Success',
        })
      );
    });
  });

  describe('mapActions', () => {
    it('returns reportUser action', () => {
      const actions = Container.mapActions({} as any);

      expect(actions.reportUser).toEqual(reportUser);
    });
  });
});
