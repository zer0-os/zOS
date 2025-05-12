import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import { RootState } from '../../../store/reducer';
import { User } from '../../../store/channels';
import { receiveSearchResults } from '../../../store/users';
import { MemberNetworks } from '../../../store/users/types';
import { searchMyNetworksByName } from '../../../platform-apps/channels/util/api';
import {
  Stage as SagaStage,
  back,
  createConversation as createConversationAction,
  createUnencryptedConversation as createUnencryptedConversationAction,
  membersSelected as membersSelectedAction,
} from '../../../store/create-conversation';
import { closeConversationErrorDialog as closeConversationErrorDialogAction } from '../../../store/chat';

import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Option } from '../lib/types';
import { Modal } from '@zero-tech/zui/components';
import { ErrorDialog } from '../../error-dialog';
import { ErrorDialogContent } from '../../../store/chat/types';
import { RewardsModalContainer } from '../../rewards-modal/container';
import { closeRewardsDialog as closeRewardsDialogAction } from '../../../store/rewards';
import { InviteDialogContainer } from '../../invite-dialog/container';
import { Button } from '@zero-tech/zui/components/Button';
import { IconPlus } from '@zero-tech/zui/icons';
import { GroupTypeDialog } from './group-details-panel/group-type-dialog';
import { Content as SidekickContent } from '../../sidekick/components/content';

import { bemClassName } from '../../../lib/bem';
import './styles.scss';
import { useSelector, useDispatch } from 'react-redux';

const cn = bemClassName('direct-message-members');

export type GetUser = (id: string) => User | undefined;

export interface PublicProperties {}

const selectStage = (state: RootState): SagaStage => state.createConversation.stage;
const selectGroupUsers = (state: RootState): Option[] => state.createConversation.groupUsers;
const selectIsFetchingExistingConversations = (state: RootState): boolean =>
  state.createConversation.startGroupChat.isLoading;
const selectcurrentUserId = (state: RootState): string | undefined => state.authentication.user?.data?.id;
const selectActiveConversationId = (state: RootState): string | undefined => state.chat.activeConversationId;
const selectJoinRoomErrorContent = (state: RootState): ErrorDialogContent | undefined =>
  state.chat.joinRoomErrorContent;
const selectIsRewardsDialogOpen = (state: RootState): boolean => state.rewards.showRewardsInPopup;
const selectIsSecondaryConversationDataLoaded = (state: RootState): boolean =>
  state.chat.isSecondaryConversationDataLoaded;
const selectUsersMap = (state: RootState): { [id: string]: User } => state.normalized['users'] || {};

const MessengerListContainer: React.FC<PublicProperties> = (_props) => {
  const dispatch = useDispatch();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isGroupTypeDialogOpen, setIsGroupTypeDialogOpen] = useState(false);
  const [isCollapsed] = useState(false);

  const stage = useSelector(selectStage);
  const groupUsers = useSelector(selectGroupUsers);
  const isFetchingExistingConversations = useSelector(selectIsFetchingExistingConversations);
  const currentUserId = useSelector(selectcurrentUserId);
  const activeConversationId = useSelector(selectActiveConversationId);
  const joinRoomErrorContent = useSelector(selectJoinRoomErrorContent);
  const isRewardsDialogOpen = useSelector(selectIsRewardsDialogOpen);
  const isSecondaryConversationDataLoaded = useSelector(selectIsSecondaryConversationDataLoaded);
  const usersFromState = useSelector(selectUsersMap);
  const currentSearchResolveRef = useRef<((value: any) => void) | null>(null);

  const performSearch = useCallback(
    async (searchText: string) => {
      const usersApiResult: MemberNetworks[] = await searchMyNetworksByName(searchText);
      const mappedFilteredUsers = usersApiResult
        ?.filter((user) => user.id !== currentUserId)
        .map((user) => ({
          ...user,
          image: usersFromState[user.id]?.profileImage ?? user.profileImage,
          profileImage: usersFromState[user.id]?.profileImage ?? user.profileImage,
        }));

      dispatch(receiveSearchResults(mappedFilteredUsers));

      if (currentSearchResolveRef.current) {
        currentSearchResolveRef.current(mappedFilteredUsers);
        currentSearchResolveRef.current = null;
      }
    },
    [currentUserId, usersFromState, dispatch]
  );

  const debouncedSearch = useMemo(() => {
    return debounce(performSearch, 800);
  }, [performSearch]);

  useEffect(() => {
    return () => {
      if (debouncedSearch && typeof debouncedSearch.cancel === 'function') {
        debouncedSearch.cancel();
      }
    };
  }, [debouncedSearch]);

  const usersInMyNetworks = useCallback(
    (search: string): Promise<MemberNetworks[]> => {
      return new Promise((resolve) => {
        currentSearchResolveRef.current = resolve;
        debouncedSearch(search);
      });
    },
    [debouncedSearch]
  );

  const createOneOnOneConversation = useCallback(
    (id: string) => {
      dispatch(createConversationAction({ userIds: [id] }));
    },
    [dispatch]
  );

  const groupMembersSelected = useCallback(
    async (selectedOptions: Option[]) => {
      dispatch(membersSelectedAction({ users: selectedOptions }));
    },
    [dispatch]
  );

  const createGroup = useCallback(
    async (details: { name: string; users: Option[]; image?: File; groupType: string }) => {
      const conversation = {
        name: details.name,
        userIds: details.users.map((u) => u.value),
        image: details.image,
        groupType: details.groupType,
      };

      if (details.groupType !== 'encrypted') {
        dispatch(createUnencryptedConversationAction(conversation));
      } else {
        dispatch(createConversationAction(conversation));
      }
    },
    [dispatch]
  );

  const handleBack = useCallback(() => {
    dispatch(back());
  }, [dispatch]);

  const handleCloseConversationErrorDialog = useCallback(() => {
    dispatch(closeConversationErrorDialogAction());
  }, [dispatch]);

  const handleCloseRewardsDialog = useCallback(() => {
    dispatch(closeRewardsDialogAction());
  }, [dispatch]);

  const openInviteDialog = useCallback(() => setIsInviteDialogOpen(true), []);
  const closeInviteDialog = useCallback(() => setIsInviteDialogOpen(false), []);

  const openGroupTypeDialog = useCallback(() => setIsGroupTypeDialogOpen(true), []);
  const closeGroupTypeDialog = useCallback(() => setIsGroupTypeDialogOpen(false), []);

  const isErrorDialogOpen = !!joinRoomErrorContent;

  const renderErrorDialog = () => (
    <Modal open={isErrorDialogOpen} onOpenChange={handleCloseConversationErrorDialog}>
      <ErrorDialog
        header={joinRoomErrorContent!.header}
        body={joinRoomErrorContent!.body}
        linkText={joinRoomErrorContent?.linkText}
        linkPath={joinRoomErrorContent?.linkPath}
        onClose={handleCloseConversationErrorDialog}
      />
    </Modal>
  );

  const renderInviteDialog = () => (
    <Modal open={isInviteDialogOpen} onOpenChange={closeInviteDialog}>
      <InviteDialogContainer onClose={closeInviteDialog} />
    </Modal>
  );

  const renderGroupTypeDialog = () => (
    <Modal open={isGroupTypeDialogOpen} onOpenChange={closeGroupTypeDialog}>
      <GroupTypeDialog onClose={closeGroupTypeDialog} />
    </Modal>
  );

  const renderRewardsDialog = () => <RewardsModalContainer onClose={handleCloseRewardsDialog} />;

  const renderCreateConversation = () => (
    <>
      {stage === SagaStage.None && (
        <ConversationListPanel
          search={usersInMyNetworks}
          onCreateConversation={createOneOnOneConversation}
          currentUserId={currentUserId}
          activeConversationId={activeConversationId}
          isLabelDataLoaded={isSecondaryConversationDataLoaded}
          isCollapsed={isCollapsed}
        />
      )}
      {stage === SagaStage.InitiateConversation && (
        <CreateConversationPanel
          initialSelections={groupUsers}
          isSubmitting={isFetchingExistingConversations}
          onBack={handleBack}
          search={usersInMyNetworks}
          onCreateOneOnOne={createOneOnOneConversation}
          onStartGroup={groupMembersSelected}
          onOpenInviteDialog={openInviteDialog}
        />
      )}
      {stage === SagaStage.GroupDetails && (
        <GroupDetailsPanel
          users={groupUsers}
          onCreate={createGroup}
          onOpenGroupTypeDialog={openGroupTypeDialog}
          onBack={handleBack}
        />
      )}
    </>
  );

  const renderFooterButton = () => (
    <div {...cn('footer-button-container')}>
      <Button {...cn('footer-button')} onPress={openInviteDialog} startEnhancer={<IconPlus size={20} isFilled />}>
        Invite Friends
      </Button>
    </div>
  );

  const isExpanded = !isCollapsed;

  return (
    <>
      <SidekickContent>
        {renderCreateConversation()}
        {joinRoomErrorContent && renderErrorDialog()}
        {isRewardsDialogOpen && renderRewardsDialog()}
        {isGroupTypeDialogOpen && renderGroupTypeDialog()}
      </SidekickContent>
      {isExpanded && stage === SagaStage.None && renderFooterButton()}
      {renderInviteDialog()}
    </>
  );
};

export const MessengerList = React.memo(MessengerListContainer);
