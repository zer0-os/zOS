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
      currentPrimaryZID: '0://john:doe',
      ownedZIDs: [],
      loadingZIDs: false,
      editProfile: () => null,
      startProfileEdit: () => null,
      fetchOwnedZIDs: () => null,
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
        currentPrimaryZID: '0://john:doe',
        ownedZIDs: [],
      })
    );
  });

  it('calls startProfileEdit on componentDidMount', () => {
    const startProfileEditMock = jest.fn();
    const wrapper = subject({ startProfileEdit: startProfileEditMock });

    wrapper.instance().componentDidMount();

    expect(startProfileEditMock).toHaveBeenCalled();
  });

  it('calls fetchOwnedZIDs on componentDidMount', () => {
    const fetchOwnedZIDsMock = jest.fn();
    const wrapper = subject({ fetchOwnedZIDs: fetchOwnedZIDsMock });

    wrapper.instance().componentDidMount();

    expect(fetchOwnedZIDsMock).toHaveBeenCalled();
  });

  describe('mapState', () => {
    // Mock the state with relevant properties for the editProfileState and user
    const stateMock: RootState = {
      editProfile: {
        errors: [],
        state: 0, // Set the initial editProfileState to State.NONE
        ownedZIDs: [],
      },
      authentication: {
        user: {
          data: {
            profileSummary: {
              firstName: 'John Doe',
              profileImage: 'profile.jpg',
            },
            primaryZID: '0://john:doe',
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

    it('currentPrimaryZID', () => {
      const props = Container.mapState(stateMock);

      expect(props.currentPrimaryZID).toEqual('0://john:doe');
    });

    it('ownedZIDs', () => {
      const props = Container.mapState(stateMock);

      expect(props.ownedZIDs).toEqual([]);
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
