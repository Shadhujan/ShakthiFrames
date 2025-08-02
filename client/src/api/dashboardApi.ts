import axios from 'axios';

export const getDashboardStats = async (token: string) => {
  const response = await axios.get('/api/v1/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};