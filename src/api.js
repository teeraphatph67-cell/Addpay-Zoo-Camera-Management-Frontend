const res = await fetch('/api/todos');

async function http(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `HTTP ${res.status}`);
  }
  // ถ้า response ว่าง (204) ไม่ต้อง parse
  if (res.status === 204) return null;
  return res.json();
}

export const listTodos  = () => http('/todos', { method: 'GET' });
export const createTodo = (title) =>
  http('/todos', { method: 'POST', body: JSON.stringify({ title }) });
export const updateTodo = (id, data) =>
  http(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTodo = (id) =>
  http(`/todos/${id}`, { method: 'DELETE' });
