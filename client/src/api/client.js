// API Base URL - empty string uses Vite dev proxy, or fallbacks to localhost:5000 in direct mode
const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  // Don't set Content-Type if sending FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Essential for session cookies
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    throw err;
  }
}

export const api = {
  // Auth
  signup: (userData) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request('/api/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    request('/api/auth/me', {
      method: 'GET',
    }),

  // Public Feed
  getPublicFeed: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.tag) searchParams.append('tag', params.tag);
    const qs = searchParams.toString();
    return request(`/api/posts/public${qs ? `?${qs}` : ''}`);
  },

  getPublicPost: (id) =>
    request(`/api/posts/public/${id}`),

  // User Posts (Protected)
  getUserPosts: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    const qs = searchParams.toString();
    return request(`/api/posts${qs ? `?${qs}` : ''}`);
  },

  getUserPost: (id) =>
    request(`/api/posts/${id}`),

  createPost: (formDataOrJson) => {
    const isFormData = formDataOrJson instanceof FormData;
    return request('/api/posts', {
      method: 'POST',
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
  },

  updatePost: (id, formDataOrJson) => {
    const isFormData = formDataOrJson instanceof FormData;
    return request(`/api/posts/${id}`, {
      method: 'PUT',
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson),
    });
  },

  deletePost: (id) =>
    request(`/api/posts/${id}`, {
      method: 'DELETE',
    }),
};
