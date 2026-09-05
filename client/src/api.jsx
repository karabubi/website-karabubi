const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const request = async (
  path,
  options = {}
) => {
  const token =
    localStorage.getItem(
      "websiteKarabubiToken"
    );

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      credentials: "include",
      headers,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.error ||
      data.message ||
      "Request failed."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export const register = (payload) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const login = (payload) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getCurrentUser = () =>
  request("/auth/me");

export const logout = () =>
  request("/auth/logout", {
    method: "POST",
  });

export const getPrivateDashboard = () =>
  request("/private/dashboard");

export default request;
