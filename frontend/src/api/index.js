const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api` || "http://localhost:5000/api";

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  auth: {
    register: (data) =>
      api.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data) =>
      api.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMe: () => api.request("/auth/me"),
  },

  videos: {
    upload: async (formData, onProgress) => {
      const token = localStorage.getItem("token");
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress?.(Math.round(percentComplete));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(
              new Error(JSON.parse(xhr.responseText).message || "Upload failed")
            );
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("POST", `${API_URL}/videos/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });
    },
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/videos?${query}`);
    },
    get: (id) => api.request(`/videos/${id}`),
    update: (id, data) =>
      api.request(`/videos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id) => api.request(`/videos/${id}`, { method: "DELETE" }),
    assign: (id, userIds) =>
      api.request(`/videos/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ userIds }),
      }),
    getStreamUrl: (id) => `${API_URL}/videos/${id}/stream`,
  },

  users: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return api.request(`/users?${query}`);
    },
    updateRole: (id, role) =>
      api.request(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    toggleStatus: (id) =>
      api.request(`/users/${id}/status`, { method: "PATCH" }),
  },
};

export default api;
