const API_BASE = import.meta.env.VITE_SERVER || 'http://localhost:3030';

export const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    credentials: 'include', // IMPORTANTE: para enviar cookies automáticamente
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Función específica para login
export const loginUser = async (email, password) => {
  return apiRequest('/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

// Función específica para registro
export const registerUser = async (userData) => {
  return apiRequest('/user/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

// Función para obtener perfil
export const getProfile = async () => {
  return apiRequest('/user/profile');
};

// Función para logout
export const logoutUser = async () => {
  return apiRequest('/user/logout', {
    method: 'POST'
  });
};