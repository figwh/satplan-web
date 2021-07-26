import request from '@/utils/request';
import { NewSatParam, UpdateSatParam } from './data';

export async function querySat() {
  const data = await request('/api/sat/all');
  return {
    data: data.dataList,
    page: 1,
    success: true,
    total: data.totalCount,
  };
}

export async function batRemoveSat(satIds: number[]) {
  return request(`/api/sat/bat`, {
    method: 'DELETE',
    data: {
      intParam: satIds,
    },
  });
}

export async function removeSat(satId: number) {
  return request(`/api/sat/${satId}`, {
    method: 'DELETE'
  });
}

export async function addSat(params: NewSatParam) {
  return request('/api/sat/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function updateSat(satId: number, params: UpdateSatParam) {
  return request(`/api/sat/update/${satId}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}
