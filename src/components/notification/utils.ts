export function mapNotification(notification, channelName) {
  const { notificationType = undefined } = notification;

  const channelText = channelName ? `#${channelName}` : 'a channel';
  let senderName = displayName(notification.originUser?.profileSummary);

  const result = {
    id: notification.id,
    createdAt: notification.createdAt,
    originatingName: senderName,
    originatingImageUrl: notification.originUser?.profileSummary?.profileImage,
    isUnread: notification.isUnread,
    body: undefined,
  };

  if (notificationType === 'chat_channel_mention') {
    return { ...result, ...{ body: `${senderName} mentioned you in ${channelText}` } };
  } else if (notificationType === 'chat_channel_message_replied') {
    return { ...result, ...{ body: `${senderName} replied to you in ${channelText}` } };
  } else if (notificationType === 'chat_dm_mention') {
    return { ...result, ...{ body: `${senderName} mentioned you in a conversation` } };
  } else if (notificationType === 'chat_dm_message_replied') {
    return { ...result, ...{ body: `${senderName} replied to you in a conversation` } };
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
