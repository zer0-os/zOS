import React from 'react';
import { connectContainer } from '../../../store/redux-container';

import { RootState } from '../../../store/reducer';
import { debugDeviceList, debugRoomKeys, fetchDeviceInfo } from '../../../store/matrix';
import { Encryption } from '.';
import { Channel, denormalize as denormalizeChannel } from '../../../store/channels';
import { currentUserSelector } from '../../../store/authentication/selectors';

interface PublicProperties {}

export interface Properties extends PublicProperties {
  deviceId: string;
  currentUserId: string;
  room: Channel;

  fetchInfo: () => void;
  debugDeviceList: (userIds: string[]) => void;
  debugRoomKeys: (roomId: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      matrix,
      chat: { activeConversationId },
    } = state;

    const user = currentUserSelector(state);

    let room = null;
    if (activeConversationId) {
      room = denormalizeChannel(activeConversationId, state) || null;
    }

    return {
      deviceId: matrix.deviceId,
      currentUserId: user?.matrixId,
      room,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      debugDeviceList,
      debugRoomKeys,
      fetchInfo: fetchDeviceInfo,
    };
  }

  componentDidMount() {
    this.props.fetchInfo();
  }

  showDeviceList = () => {
    if (this.props.room) {
      this.props.debugDeviceList([...this.props.room.otherMembers.map((m) => m.matrixId), this.props.currentUserId]);
    }
  };

  showRoomKeys = () => {
    if (this.props.room) {
      this.props.debugRoomKeys(this.props.room.id);
    }
  };

  render() {
    return (
      <Encryption
        userId={this.props.currentUserId}
        deviceId={this.props.deviceId}
        roomId={this.props.room?.id || ''}
        otherMembers={this.props.room?.otherMembers || []}
        onDeviceList={this.showDeviceList}
        onRoomKeys={this.showRoomKeys}
      />
    );
  }
}

export const EncryptionContainer = connectContainer<PublicProperties>(Container);
