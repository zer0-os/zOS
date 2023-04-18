export function mapNotification(notification, channelName?: string) {
  const channelText = channelName ? `#${channelName}` : 'a channel';

  if (notification.notificationType === 'chat_channel_mention') {
    let senderName = displayName(notification.originUser?.profileSummary);

    return {
      id: notification.id,
      createdAt: notification.createdAt,
      body: `${senderName} mentioned you in ${channelText}`,
      originatingName: senderName,
      originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
      isUnread: notification.isUnread,
    };
  } else if (notification.notificationType === 'chat_channel_message_replied') {
    let senderName = displayName(notification.originUser?.profileSummary);

    return {
      id: notification.id,
      createdAt: notification.createdAt,
      body: `${senderName} replied to you in ${channelText}`,
      originatingName: senderName,
      originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
      isUnread: notification.isUnread,
    };
  } else if (notification.notificationType === 'chat_dm_mention') {
    let senderName = displayName(notification.originUser?.profileSummary);
    return {
      id: notification.id,
      createdAt: notification.createdAt,
      body: `${senderName} mentioned you in a conversation`,
      originatingName: senderName,
      originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
      isUnread: notification.isUnread,
    };
  }

  return null;
}

function displayName(profileSummary) {
  let displayName = [
    profileSummary?.firstName,
    profileSummary?.lastName,
  ]
    .filter((e) => e)
    .join(' ');
  displayName = displayName || 'Someone';
  return displayName;
}
