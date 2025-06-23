/**
 * @note 14/04/2025
 * This is a slight adaptation from zOS API (named UserProfileView).
 * https://github.com/zer0-os/zos-api/blob/71e8dda5dfcee541aaacfb3cf86f420136c17046/src/loopback/models/user-profile-view.ts
 */
export interface ProfileData {
  userId: string;
  /**
   * primaryZID in zOS API.
   */
  primaryZid: string;
  /**
   * firstName in zOS API.
   */
  handle?: string;
  profileImage?: string;
  publicAddress?: string;
  /**
   * Number of users following this profile
   */
  followersCount?: number;
  /**
   * Number of users this profile follows
   */
  followingCount?: number;
  /**
   * Whether the profile is subscribed to ZERO Pro
   */
  isZeroProSubscribed?: boolean;
}
