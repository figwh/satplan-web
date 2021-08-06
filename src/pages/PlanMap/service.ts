import request from '@/utils/request';
import { PlanPara } from './data'

export async function querySatTree() {
  return await request(`/api/sattree`);
}

export async function querySensorPaths(planParam: PlanPara) {
  return request(`/api/satplan`,{
    method: 'POST',
    data: {
      ...planParam,
    },
  });
}