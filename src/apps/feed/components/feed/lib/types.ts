export interface QuotedPost {
  id: string;
  userId: string;
  zid: string;
  createdAt: string;
  text: string;
  arweaveId: string;
  mediaId?: string;
  userProfileView: {
    userId: string;
    firstName: string;
    profileImage?: string;
    isZeroProSubscriber: boolean;
  };
}
