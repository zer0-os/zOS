import Cookies from 'js-cookie';

const ACCESS_TOKEN_COOKIE_NAME = 'zero-access-token';

export function getAccessTokenCookie() {
  return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
}
