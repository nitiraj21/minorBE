import api from './axios';

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post('/user/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/user/register', {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginAdmin = async (email: string, password: string) => {
  try {
    const response = await api.post('/admin/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerAdmin = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/admin/register', {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 