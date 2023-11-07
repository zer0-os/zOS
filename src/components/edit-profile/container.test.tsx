import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { editProfile, startProfileEdit } from '../../store/edit-profile';
import { RootState } from '../../store/reducer';
import { EditProfile } from '.';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      errors: {},
      editProfileState: 0, // Set the initial editProfileState to State.NONE
      currentDisplayName: 'John Doe',
      currentProfileImage: 'profile.jpg',
      editProfile: () => null,
      startProfileEdit: () => null,
      leaveGlobalNetwork: () => null,
      joinGlobalNetwork: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', () => {
    const wrapper = subject({});

    expect(wrapper.find(EditProfile).props()).toEqual(
      expect.objectContaining({
        errors: {},
        editProfileState: 0,
        currentDisplayName: 'John Doe',
        currentProfileImage: 'profile.jpg',
      })
    );
  });

  it('calls startProfileEdit on componentDidMount', () => {
    const startProfileEditMock = jest.fn();
    const wrapper = subject({ startProfileEdit: startProfileEditMock });

    wrapper.instance().componentDidMount();

    expect(startProfileEditMock).toHaveBeenCalled();
  });

  describe('mapState', () => {
    // Mock the state with relevant properties for the editProfileState and user
    const stateMock: RootState = {
      editProfile: {
        errors: [],
        state: 0, // Set the initial editProfileState to State.NONE
      },
      authentication: {
        user: {
          data: {
            profileSummary: {
              firstName: 'John Doe',
              profileImage: 'profile.jpg',
            },
          },
        },
      },
    } as RootState;

    it('editProfileState', () => {
      const props = Container.mapState(stateMock);

      expect(props.editProfileState).toBe(0);
    });

    it('currentDisplayName', () => {
      const props = Container.mapState(stateMock);

      expect(props.currentDisplayName).toEqual('John Doe');
    });

    it('currentProfileImage', () => {
      const props = Container.mapState(stateMock);

      expect(props.currentProfileImage).toEqual('profile.jpg');
    });

    it('errors', () => {
      const props = Container.mapState(stateMock);

      expect(props.errors).toEqual({});
    });
  });

  describe('mapActions', () => {
    const actions = Container.mapActions({} as any) as Partial<Properties>;

    it('returns editProfile action', () => {
      expect(actions.editProfile).toEqual(editProfile);
    });

    it('returns startProfileEdit action', () => {
      expect(actions.startProfileEdit).toEqual(startProfileEdit);
    });
  });
});
