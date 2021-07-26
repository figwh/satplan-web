import { stringify } from 'querystring';
import { history, Reducer, Effect } from 'umi';

import { userLogin } from '@/services/login';
import { setAuthority,setAccessToken } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { message } from 'antd';

export enum UserRole {
  USER = "user",
  GUEST = "guest",
  ADMIN = "admin",
  PLATFORM_ADMIN = "platform_admin",
}

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: UserRole.USER | UserRole.GUEST | UserRole.ADMIN;
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    saveAccessToken: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(userLogin, payload);
      yield put({
        type: 'saveAccessToken',
        payload: response,
      });
      // Login successfully
      if (response.code === 200) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        message.success('登录成功！');
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        history.replace(redirect || '/');
      }
    },

    logout() {
      const { redirect } = getPageQuery();
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/user/login' && !redirect) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },

  reducers: {
    saveAccessToken(state, { payload }) {
      setAccessToken(payload.token);
      return {
        ...state,
      };
    },
  },
};

export default Model;
