import React from 'react';
import { shallow } from 'enzyme';
import { Container, Properties } from './container';
import { editProfile, setChangesSaved } from '../../store/edit-profile';
import { RootState } from '../../store/reducer';
import { EditProfile } from '.';
import { ProfileDetailsErrors } from '../../store/registration';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isLoading: false,
      errors: {},
      changesSaved: false,
      currentDisplayName: 'John Doe',
      currentProfileImage: 'profile.jpg',
      editProfile: () => null,
      setChangesSaved: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes data down', () => {
    const wrapper = subject({ isLoading: true });

    expect(wrapper.find(EditProfile).props()).toEqual(
      expect.objectContaining({
        isLoading: true,
      })
    );
  });

  // it('calls editProfile onEdit', () => {
  //   const editProfileMock = jest.fn();
  //   const wrapper = subject({ editProfile: editProfileMock });

  //   const formData = {
  //     name: 'Jane Smith',
  //     image: new File([], 'image.jpg'),
  //   };

  //   wrapper.find(EditProfile).props().onEdit(formData);

  //   expect(editProfileMock).toHaveBeenCalledWith(formData);
  // });

  it('calls setChangesSaved on componentWillUnmount', () => {
    const setChangesSavedMock = jest.fn();
    const wrapper = subject({ setChangesSaved: setChangesSavedMock });

    wrapper.unmount();

    expect(setChangesSavedMock).toHaveBeenCalledWith(false);
  });

  describe('mapState', () => {
    const subject = (
      editProfileState: Partial<Properties['editProfile']>,
      userState: Partial<RootState['authentication']['user']>
    ) => {
      const state = {
        editProfile: {
          loading: false,
          errors: [],
          changesSaved: false,
          ...editProfileState,
        },
        authentication: {
          user: {
            data: {
              profileSummary: {
                firstName: 'John Doe',
                profileImage: 'profile.jpg',
              },
            },
            ...userState,
          },
        },
      } as RootState;
      return Container.mapState(state);
    };

    it('isLoading', () => {
      const props = subject({ loading: true }, {});

      expect(props.isLoading).toEqual(true);
    });

    it('currentDisplayName', () => {
      const props = subject({}, {});

      expect(props.currentDisplayName).toEqual('John Doe');
    });

    it('currentProfileImage', () => {
      const props = subject({}, {});

      expect(props.currentProfileImage).toEqual('profile.jpg');
    });

    describe('editProfile errors', () => {
      it('failed upload', () => {
        const props = subject({ errors: [ProfileDetailsErrors.FILE_UPLOAD_ERROR] }, {});

        expect(props.errors).toEqual({ image: 'Error uploading image' });
      });

      it('unknown error', () => {
        const props = subject({ errors: [ProfileDetailsErrors.UNKNOWN_ERROR] }, {});

        expect(props.errors).toEqual({ general: 'An error has occurred' });
      });
    });
  });

  describe('mapActions', () => {
    const subject = () => {
      return Container.mapActions({} as any) as Partial<Properties>;
    };

    it('returns editProfile action', () => {
      const actions = subject();

      expect(actions.editProfile).toEqual(editProfile);
    });

    it('returns setChangesSaved action', () => {
      const actions = subject();

      expect(actions.setChangesSaved).toEqual(setChangesSaved);
    });
  });
});
