import React from 'react';
import { debounce } from 'lodash';
import { connectContainer } from '../../../store/redux-container';
import { RootState } from '../../../store/reducer';
import { Channel, onAddLabel, onRemoveLabel, openConversation, User } from '../../../store/channels';
import { allDenormalizedChannelsSelector } from '../../../store/channels/selectors';
import { byBumpStamp, isOneOnOne } from '../../../store/channels-list/utils';
import { denormalize as denormalizeUser, receiveSearchResults } from '../../../store/users';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import {
  Stage as SagaStage,
  back,
  createConversation,
  createUnencryptedConversation,
  membersSelected,
  startCreateConversation,
} from '../../../store/create-conversation';
import { CreateMessengerConversation } from '../../../store/channels/types';
import { closeConversationErrorDialog } from '../../../store/chat';

import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../lib/types';
import { MembersSelectedPayload } from '../../../store/create-conversation/types';
import { getMessagePreview, previewDisplayDate } from '../../../lib/chat/chat-message';
import { Modal } from '@zero-tech/zui/components';
import { ErrorDialog } from '../../error-dialog';
import { ErrorDialogContent } from '../../../store/chat/types';
import { RewardsModalContainer } from '../../rewards-modal/container';
import { closeRewardsDialog } from '../../../store/rewards';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { Button } from '@zero-tech/zui/components/Button';
import { IconPlus } from '@zero-tech/zui/icons';
import { GroupTypeDialog } from './group-details-panel/group-type-dialog';
import { Message } from '../../../store/messages';
import { Content as SidekickContent } from '../../sidekick/components/content';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';

const cn = bemClassName('direct-message-members');

type GetUser = (id: string) => User | undefined;

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  stage: SagaStage;
  groupUsers: Option[];
  conversations: (Channel & { messagePreview?: string; previewDisplayDate?: string })[];
  isFetchingExistingConversations: boolean;
  myUserId: string;
  activeConversationId?: string;
  joinRoomErrorContent: ErrorDialogContent;
  isRewardsDialogOpen: boolean;
  isSecondaryConversationDataLoaded: boolean;
  users: { [id: string]: User };

  startCreateConversation: () => void;
  back: () => void;
  membersSelected: (payload: MembersSelectedPayload) => void;
  createConversation: (payload: CreateMessengerConversation) => void;
  createUnencryptedConversation: (payload: CreateMessengerConversation) => void;
  onConversationClick: (payload: { conversationId: string }) => void;
  receiveSearchResults: (data) => void;
  closeConversationErrorDialog: () => void;
  closeRewardsDialog: () => void;
  onAddLabel: () => void;
  onRemoveLabel: () => void;
}

interface State {
  isInviteDialogOpen: boolean;
  isGroupTypeDialogOpen: boolean;
  isCollapsed: boolean;
}

export class Container extends React.Component<Properties, State> {
  private debouncedSearch: any;
  private currentSearchResolve: ((value: any) => void) | null = null;

  static mapState(state: RootState): Partial<Properties> {
    const {
      createConversation,
      authentication: { user },
      chat: { activeConversationId, joinRoomErrorContent, isSecondaryConversationDataLoaded },
      rewards,
    } = state;

    const currentUserId = user?.data?.id;
    const getUser: GetUser = (id) => denormalizeUser(id, state);
    const mapWithMessageMeta = addLastMessageMeta(currentUserId, getUser);
    const conversations = allDenormalizedChannelsSelector(state)
      // Ensure that we have a bumpstamp. If not, the channel doesn't have all it's data yet
      // and it'll be filled in on the next sync
      .filter((c: Channel) => !c.isSocialChannel && 'bumpStamp' in c)
      .map(mapWithMessageMeta)
      .sort(byBumpStamp);
    return {
      conversations,
      activeConversationId,
      stage: createConversation.stage,
      groupUsers: createConversation.groupUsers,
      isFetchingExistingConversations: createConversation.startGroupChat.isLoading,
      myUserId: user?.data?.id,
      joinRoomErrorContent,
      isRewardsDialogOpen: rewards.showRewardsInPopup,
      isSecondaryConversationDataLoaded,
      users: state.normalized['users'] || {},
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      onConversationClick: openConversation,
      createConversation,
      createUnencryptedConversation,
      startCreateConversation,
      back,
      membersSelected,
      receiveSearchResults,
      closeConversationErrorDialog,
      closeRewardsDialog,
      onAddLabel,
      onRemoveLabel,
    };
  }

  constructor(props: Properties) {
    super(props);
    this.state = {
      isInviteDialogOpen: false,
      isGroupTypeDialogOpen: false,
      isCollapsed: false,
    };

    // Create a debounced version of the search function
    this.debouncedSearch = debounce(this.performSearch, 800);
  }

  componentWillUnmount() {
    // Cancel any pending debounced searches
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
    const { users: usersFromState, myUserId, receiveSearchResults } = this.props;
    const users: MemberNetworks[] = await searchMyNetworksByName(search);

    const mappedFilteredUsers = users
      ?.filter((user) => user.id !== myUserId)
      .map((user) => ({
        ...user,
        // since redux state has local blob url image
        image: usersFromState[user.id]?.profileImage ?? user.profileImage,
        profileImage: usersFromState[user.id]?.profileImage ?? user.profileImage,
      }));

    // Send the filtered results to the state handler
    receiveSearchResults(mappedFilteredUsers);

    if (this.currentSearchResolve) {
      this.currentSearchResolve(mappedFilteredUsers);
      this.currentSearchResolve = null;
    }
  };

  startCreateConversation = () => {
    this.props.startCreateConversation();
  };

  createOneOnOneConversation = (id: string) => {
    this.props.createConversation({ userIds: [id] });
  };

  groupMembersSelected = async (selectedOptions: Option[]) => {
    this.props.membersSelected({ users: selectedOptions });
  };

  createGroup = async (details) => {
    const conversation = {
      name: details.name,
      userIds: details.users.map((u) => u.value),
      image: details.image,
      groupType: details.groupType,
    };

    if (details.groupType !== 'encrypted') {
      this.props.createUnencryptedConversation(conversation);
    } else {
      this.props.createConversation(conversation);
    }
  };

  collapse = () => {
    this.setState({ isCollapsed: true });
  };

  expand = () => {
    this.setState({ isCollapsed: false });
  };

  openInviteDialog = () => {
    this.setState({ isInviteDialogOpen: true });
  };

  closeInviteDialog = () => {
    this.setState({ isInviteDialogOpen: false });
  };

  openGroupTypeDialog = () => {
    this.setState({ isGroupTypeDialogOpen: true });
  };

  closeGroupTypeDialog = () => {
    this.setState({ isGroupTypeDialogOpen: false });
  };

  closeErrorDialog = () => {
    this.props.closeConversationErrorDialog();
  };

  get isErrorDialogOpen(): boolean {
    return !!this.props.joinRoomErrorContent;
  }

  renderErrorDialog = (): JSX.Element => {
    return (
      <Modal open={this.isErrorDialogOpen} onOpenChange={this.closeErrorDialog}>
        <ErrorDialog
          header={this.props.joinRoomErrorContent.header}
          body={this.props.joinRoomErrorContent.body}
          linkText={this.props.joinRoomErrorContent?.linkText}
          linkPath={this.props.joinRoomErrorContent?.linkPath}
          onClose={this.closeErrorDialog}
        />
      </Modal>
    );
  };

  renderInviteDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.isInviteDialogOpen} onOpenChange={this.closeInviteDialog}>
        <InviteDialogContainer onClose={this.closeInviteDialog} />
      </Modal>
    );
  };

  renderGroupTypeDialog = (): JSX.Element => {
    return (
      <Modal open={this.state.isGroupTypeDialogOpen} onOpenChange={this.closeGroupTypeDialog}>
        <GroupTypeDialog onClose={this.closeGroupTypeDialog} />
      </Modal>
    );
  };

  renderRewardsDialog = (): JSX.Element => {
    return <RewardsModalContainer onClose={this.props.closeRewardsDialog} />;
  };

  renderCreateConversation() {
    return (
      <>
        {this.props.stage === SagaStage.None && (
          <ConversationListPanel
            search={this.usersInMyNetworks}
            conversations={this.props.conversations}
            onCreateConversation={this.createOneOnOneConversation}
            onConversationClick={this.props.onConversationClick}
            myUserId={this.props.myUserId}
            activeConversationId={this.props.activeConversationId}
            onAddLabel={this.props.onAddLabel}
            onRemoveLabel={this.props.onRemoveLabel}
            isLabelDataLoaded={this.props.isSecondaryConversationDataLoaded}
            isCollapsed={this.state.isCollapsed}
          />
        )}
        {this.props.stage === SagaStage.InitiateConversation && (
          <CreateConversationPanel
            initialSelections={this.props.groupUsers}
            isSubmitting={this.props.isFetchingExistingConversations}
            onBack={this.props.back}
            search={this.usersInMyNetworks}
            onCreateOneOnOne={this.createOneOnOneConversation}
            onStartGroup={this.groupMembersSelected}
            onOpenInviteDialog={this.openInviteDialog}
          />
        )}
        {this.props.stage === SagaStage.GroupDetails && (
          <GroupDetailsPanel
            users={this.props.groupUsers}
            onCreate={this.createGroup}
            onOpenGroupTypeDialog={this.openGroupTypeDialog}
            onBack={this.props.back}
          />
        )}
      </>
    );
  }

  renderFooterButton() {
    return (
      <div {...cn('footer-button-container')}>
        <Button
          {...cn('footer-button')}
          onPress={this.openInviteDialog}
          startEnhancer={<IconPlus size={20} isFilled />}
        >
          Invite Friends
        </Button>
      </div>
    );
  }

  render() {
    const isCollapsed = this.state.isCollapsed;
    const isExpanded = !isCollapsed;

    return (
      <>
        <SidekickContent>
          {this.renderCreateConversation()}
          {this.props.joinRoomErrorContent && this.renderErrorDialog()}
          {this.props.isRewardsDialogOpen && this.renderRewardsDialog()}
          {this.state.isGroupTypeDialogOpen && this.renderGroupTypeDialog()}
        </SidekickContent>
        {isExpanded && this.props.stage === SagaStage.None && this.renderFooterButton()}
        {this.renderInviteDialog()}
      </>
    );
  }
}

type ConversationWithMessageMeta = Channel & {
  mostRecentMessage?: Message;
  messagePreview?: string;
  previewDisplayDate?: string;
};
function addLastMessageMeta(
  currentUserId: string,
  getUser: GetUser
): (conversation: Channel) => ConversationWithMessageMeta {
  return (conversation: Channel): ConversationWithMessageMeta => {
    let mostRecentMessage = conversation.lastMessage;

    return {
      ...conversation,
      mostRecentMessage,
      messagePreview: getMessagePreview(mostRecentMessage, currentUserId, getUser, isOneOnOne(conversation)),
      previewDisplayDate: previewDisplayDate(mostRecentMessage?.createdAt),
    };
  };
}

export const MessengerList = connectContainer<PublicProperties>(Container);
