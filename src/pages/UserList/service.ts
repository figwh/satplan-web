import request from '@/utils/request';
import { NewUserParam, UpdateUserParam } from './data';

export async function queryUser() {
  const data = await request('/api/user/all');
  return {
    data: data.dataList,
    page: 1,
    success: true,
    total: data.totalCount,
  };
}

export async function batRemoveUser(userIds: number[]) {
  return request(`/api/user/bat`, {
    method: 'DELETE',
    data: {
      intParam: userIds,
    },
  });
}

export async function removeUser(userId: number) {
  return request(`/api/user?userId=${userId}`, {
    method: 'DELETE'
  });
}

export async function addUser(params: NewUserParam) {
  return request('/api/user/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function updateUser(userId: number, params: UpdateUserParam) {
  return request(`/api/user/update/${userId}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function getAdmins() {
  return request('/api/user/admins');
}

export async function resetPassword(userId: number, newPassword: string) {
  return request(`/api/user/passwd/reset?userId=${userId}&newPassword=${newPassword}`, {
    method: 'PUT',
  });
}
