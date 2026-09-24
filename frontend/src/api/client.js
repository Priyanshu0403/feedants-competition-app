import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('feedants_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap { success, data } on the way out and normalize errors so screens
// only ever have to deal with `err.message`.
client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default client;
