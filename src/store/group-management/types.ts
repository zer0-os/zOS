export interface EditConversationErrors {
  image?: string;
  general?: string;
}

export interface GroupManagementErrors {
  addMemberError?: string; // TODO: use this instead of "addMemberError"
  editConversationErrors?: EditConversationErrors;
}
