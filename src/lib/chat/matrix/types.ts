export enum ConnectionStatus {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
}

export enum MembershipStateType {
  Invite = 'invite',
  Join = 'join',
  Leave = 'leave',
}

export enum MatrixConstants {
  RELATES_TO = 'm.relates_to',
  NEW_CONTENT = 'm.new_content',
  REPLACE = 'm.replace',
}

export enum CustomEventType {
  SEND_ADMIN_MESSAGE = 'm.custom.send_admin_message',
}
