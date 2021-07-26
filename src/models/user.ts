import { Effect, Reducer } from 'umi';

import { queryCurrent } from '@/services/user';
import { setAuthority, setUserData } from '@/utils/authority';
import { UserRole } from './login';

const UserRoleIdMap = new Map([
  [1, UserRole.PLATFORM_ADMIN],
  [2, UserRole.ADMIN],
  [3, UserRole.USER],
])

export interface MenuAuthItem {
  id?: number;
  pId?: number;
  //menuName?: string;
  url?: string;
  //icon?: string;
  //comName?: string;
  //sort?: number;
  //routingType?: number;
}

export interface CurrentUser {
  id: number;
  name: string;
  //adminId: number;
  roleId: number;
  //roleList?: Map<string, number>;
  menuList?: Array<MenuAuthItem>;
  //buttonList?: Array<MenuAuthItem>;
}

export interface UserModelState {
  currentUser?: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    //currentUser: { id: 0, name: '', adminId: 0, roleId: 0 },
    currentUser: { id: 0, name: '', roleId: 0 },
  },

  effects: {
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      if (response.code === 0 && response.dataList.length !== 0) {
        yield put({
          type: 'saveCurrentUser',
          payload: response.dataList[0],
        });
      }
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      let payload = action.payload
      let role = UserRoleIdMap.get(payload.roleId)
      role = role === undefined ? UserRole.GUEST : role
      setAuthority(role);
      setUserData(payload)
      return {
        ...state,
        currentUser: payload || {},
      };
    },
  },
};

export default UserModel;
