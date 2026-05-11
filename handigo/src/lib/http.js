const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000); // 10 detik

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeout);

    if (!res.ok) {
  const err = await res.json().catch(() => ({}));
  throw new Error(err.error || 'Request gagal');
}

const contentType = res.headers.get('content-type');

if (contentType?.includes('application/json')) {
  return res.json();
}

return null;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw err;
  }
}