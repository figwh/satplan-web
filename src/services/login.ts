import request from '@/utils/request';
import qs from 'qs';

export interface LoginParamsType {
  username: string;
  password: string;
}

export async function userLogin(params: LoginParamsType) {
  return request('/api/login', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    method: 'POST',
    body: qs.stringify(params),
  });
}