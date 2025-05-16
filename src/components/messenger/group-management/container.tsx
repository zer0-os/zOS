import React from 'react';
import { debounce } from 'lodash';
import { connectContainer } from '../../../store/redux-container';

import {
  Stage,
  back,
  addSelectedMembers,
  MembersSelectedPayload,
  editConversationNameAndIcon,
  EditConversationPayload,
  startEditConversation,
  startAddGroupMember,
  LeaveGroupDialogStatus,
  setLeaveGroupStatus,
} from '../../../store/group-management';
import { Option } from '../lib/types';

import { GroupManagement } from '.';
import { RootState } from '../../../store/reducer';
import { GroupManagementErrors, EditConversationState } from '../../../store/group-management/types';
import { User, denormalize as denormalizeChannel } from '../../../store/channels';
import { currentUserSelector } from '../../../store/authentication/selectors';
import { MemberManagementDialogContainer } from '../../group-management/member-management-dialog/container';
import { getUserSubHandle } from '../../../lib/user';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import { isOneOnOneSelector } from '../../../store/channels/selectors';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  stage: Stage;
  activeConversationId: string;
  currentUser: User;
  otherMembers: User[];
  isAddingMembers: boolean;
  addMemberError: string;
  errors: GroupManagementErrors;
  name: string;
  conversationIcon: string;
  editConversationState: EditConversationState;
  canAddMembers: boolean;
  canEditGroup: boolean;
  canLeaveGroup: boolean;
  conversationAdminIds: string[];
  conversationModeratorIds: string[];
  isOneOnOne: boolean;
  isSocialChannel: boolean;

  back: () => void;
  addSelectedMembers: (payload: MembersSelectedPayload) => void;
  editConversationNameAndIcon: (payload: EditConversationPayload) => void;
  startEditConversation: () => void;
  startAddGroupMember: () => void;
  setLeaveGroupStatus: (status: LeaveGroupDialogStatus) => void;
}

export class Container extends React.Component<Properties> {
  private debouncedSearch: any;
  private currentSearchResolve: ((value: any) => void) | null = null;

  static mapState(state: RootState): Partial<Properties> {
    const {
      groupManagement,
      chat: { activeConversationId },
    } = state;

    const conversation = denormalizeChannel(activeConversationId, state);
    const isOneOnOne = isOneOnOneSelector(state, activeConversationId);
    const currentUser = currentUserSelector(state);
    const conversationAdminIds = conversation?.adminMatrixIds;
    const conversationModeratorIds = conversation?.moderatorIds;
    const isCurrentUserRoomAdmin = conversationAdminIds?.includes(currentUser?.matrixId) ?? false;
    const isCurrentUserRoomModerator = conversationModeratorIds?.includes(currentUser?.matrixId) ?? false;

    return {
      activeConversationId,
      stage: groupManagement.stage,
      isAddingMembers: groupManagement.isAddingMembers,
      addMemberError: groupManagement.addMemberError,
      errors: groupManagement.errors,
      name: conversation?.name || '',
      isSocialChannel: conversation?.isSocialChannel || false,
      conversationIcon: conversation?.icon || '',
      currentUser: {
        userId: currentUser?.id,
        firstName: currentUser?.profileSummary.firstName,
        lastName: currentUser?.profileSummary.lastName,
        profileImage: currentUser?.profileSummary.profileImage,
        matrixId: currentUser?.matrixId,
        isOnline: currentUser?.isOnline || true,
        primaryZID: currentUser?.primaryZID,
        displaySubHandle: getUserSubHandle(currentUser?.primaryZID, currentUser?.primaryWalletAddress),
        profileId: currentUser?.profileId,
        lastSeenAt: '',
      } as User,
      otherMembers: conversation ? conversation.otherMembers : [],
      editConversationState: groupManagement.editConversationState,
      canAddMembers:
        (isCurrentUserRoomAdmin || isCurrentUserRoomModerator) && !isOneOnOne && !conversation?.isSocialChannel,
      canEditGroup: (isCurrentUserRoomAdmin || isCurrentUserRoomModerator) && !conversation?.isSocialChannel,
      canLeaveGroup:
        !isCurrentUserRoomAdmin && conversation?.otherMembers?.length > 1 && !conversation?.isSocialChannel,
      conversationAdminIds,
      conversationModeratorIds,
      isOneOnOne,
    };
  }
  static mapActions(_props: Properties): Partial<Properties> {
    return {
      back,
      addSelectedMembers,
      editConversationNameAndIcon,
      startEditConversation,
      startAddGroupMember,
      setLeaveGroupStatus,
    };
  }

  constructor(props: Properties) {
    super(props);

    this.debouncedSearch = debounce(this.performSearch, 800);
  }

  componentWillUnmount() {
    if (this.debouncedSearch && this.debouncedSearch.cancel) {
      this.debouncedSearch.cancel();
    }
  }

  usersInMyNetworks = (search: string) => {
    return new Promise((resolve) => {
      this.currentSearchResolve = resolve;
      this.debouncedSearch(search);
    });
  };

  performSearch = async (search: string) => {
    const myUserId = this.props.currentUser.userId;

    const users: MemberNetworks[] = await searchMyNetworksByName(search);

    const mappedFilteredUsers = users
      ?.filter((user) => user.id !== myUserId)
      .map((user) => ({
        ...user,
        image: user.profileImage,
      }));

    if (this.currentSearchResolve) {
      this.currentSearchResolve(mappedFilteredUsers);
      this.currentSearchResolve = null;
    }
  };

  onAddMembers = async (selectedOptions: Option[]) => {
    this.props.addSelectedMembers({ roomId: this.props.activeConversationId, users: selectedOptions });
  };

  onEditConversation = async (name: string, image: File | null) => {
    this.props.editConversationNameAndIcon({ roomId: this.props.activeConversationId, name, image });
  };

  render() {
    return (
      <>
        <GroupManagement
          stage={this.props.stage}
          currentUser={this.props.currentUser}
          otherMembers={this.props.otherMembers}
          onBack={this.props.back}
          searchUsers={this.usersInMyNetworks}
          onAddMembers={this.onAddMembers}
          isAddingMembers={this.props.isAddingMembers}
          addMemberError={this.props.addMemberError}
          errors={this.props.errors}
          name={this.props.name}
          icon={this.props.conversationIcon}
          isOneOnOne={this.props.isOneOnOne}
          onEditConversation={this.onEditConversation}
          editConversationState={this.props.editConversationState}
          canAddMembers={this.props.canAddMembers}
          canEditGroup={this.props.canEditGroup}
          canLeaveGroup={this.props.canLeaveGroup}
          startEditConversation={this.props.startEditConversation}
          conversationAdminIds={this.props.conversationAdminIds}
          conversationModeratorIds={this.props.conversationModeratorIds}
          startAddGroupMember={this.props.startAddGroupMember}
          setLeaveGroupStatus={this.props.setLeaveGroupStatus}
          isSocialChannel={this.props.isSocialChannel}
        />
        <MemberManagementDialogContainer />
      </>
    );
  }
}

export const GroupManagementContainer = connectContainer<PublicProperties>(Container);
