import request from '@/utils/request';

export async function querySatTree() {
  return await request(`/api/sattree`);
}