// src/lib/auth.js
import { setItem, getItem, removeItem } from './storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

// อายุ token สมมุติ 1 วัน (ปรับตาม API ของคุณ)
const ONE_DAY = 24 * 60 * 60 * 1000;

export function saveAuth({ token, user }) {
  if (token) setItem(TOKEN_KEY, token, ONE_DAY);
  if (user)  setItem(USER_KEY, user, ONE_DAY);
}

export function getToken() {
  return getItem(TOKEN_KEY);
}

export function getUser() {
  return getItem(USER_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  removeItem(TOKEN_KEY);
  removeItem(USER_KEY);
}

// helper สำหรับ fetch ที่แนบ Authorization อัตโนมัติ
export async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { ...options, headers });
  // ถ้า token หมดอายุ/ไม่ถูกต้อง ให้ลบแล้วโยน error
  if (res.status === 401) {
    logout();
    throw new Error('Unauthorized');
  }
  return res;
}
