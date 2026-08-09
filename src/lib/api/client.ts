import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase'; // Need to create this

export const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use(async (config) => {
  const auth = getAuth(app);
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
