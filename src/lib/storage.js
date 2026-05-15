const PREFIX = 'my-app'; // เปลี่ยนชื่อโปรเจกต์คุณได้

function k(name) { return `${PREFIX}:${name}`; }

export function setItem(name, value, ttlMs) {
  const payload = {
    v: value,
    // ถ้าไม่ส่ง ttlMs = ไม่มีวันหมดอายุ
    exp: typeof ttlMs === 'number' ? Date.now() + ttlMs : null,
  };
  localStorage.setItem(k(name), JSON.stringify(payload));
}

export function getItem(name) {
  const raw = localStorage.getItem(k(name));
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    if (payload.exp && Date.now() > payload.exp) {
      localStorage.removeItem(k(name));
      return null;
    }
    return payload.v;
  } catch {
    return null;
  }
}

export function removeItem(name) {
  localStorage.removeItem(k(name));
}

export function clearAll() {
  Object.keys(localStorage)
    .filter(key => key.startsWith(`${PREFIX}:`))
    .forEach(key => localStorage.removeItem(key));
}