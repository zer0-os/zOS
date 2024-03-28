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

export const IN_ROOM_MEMBERSHIP_STATES = [
  MembershipStateType.Invite,
  MembershipStateType.Join,
] as string[];

export enum MatrixConstants {
  RELATES_TO = 'm.relates_to',
  NEW_CONTENT = 'm.new_content',
  REPLACE = 'm.replace',
  BAD_ENCRYPTED_MSGTYPE = 'm.bad.encrypted',
  FAVORITE = 'm.favorite',
}

export enum CustomEventType {
  USER_JOINED_INVITER_ON_ZERO = 'user_joined_inviter_on_zero',
}

export enum DecryptErrorConstants {
  UNDECRYPTABLE_EDIT = 'Message edit cannot be decrypted.',
}

export enum NotifiableEventType {
  RoomMessage = 'RoomMessage',
}
