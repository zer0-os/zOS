import React from 'react';
import { getAccessTokenCookie } from '../lib/authentication';

export const AuthenticationContext = React.createContext({ isAuthenticated: !!getAccessTokenCookie() });
