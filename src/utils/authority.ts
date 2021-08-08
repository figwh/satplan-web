import { reloadAuthorized } from './Authorized';
import { CurrentUser } from '../models/user';

const TOKEN_KEY = 'SatPlan-web-access-token'
const AUTHORITY_KEY = 'SatPlan-web-authority'
const USER_DATA = 'SatPlan-web-user-data'
// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(): string | string[] {
  let authorityString = localStorage.getItem(AUTHORITY_KEY);
  if (!authorityString) {
    authorityString = 'guest'
  }
  return [authorityString]
}

export function setAuthority(authority: string): void {
  localStorage.setItem(AUTHORITY_KEY, authority);
  // auto reload
  reloadAuthorized();
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, 'Bearer ' + token);
}

export function setUserData(data: CurrentUser): void {
  localStorage.setItem('user', JSON.stringify(data));
}

export function getUserData(): CurrentUser{
  let data = localStorage.getItem('user');
  if (data) {
    return JSON.parse(data);
  } else {
    return {
      id: 0,
      name: '',
      //adminId: 0,
      roleId: 0,
      //roleList: undefined,
      menuList: undefined,
      //buttonList: undefined,
    }
  }
}
