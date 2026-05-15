// src/pages/EditCamera.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_ZOOS, API_BASE } from "../config/api";

const API_GET_CAMERA = `${API_BASE}/cameras`;
const API_LIST_CAMERAS = `${API_BASE}/Getcamera`;
const API_UPDATE_CAMERA = `${API_BASE}/cameras`;

export default function EditCamera() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    ip_address: "",
    zoo_id: "",
    camera_position: "",
    animal_name: "",
    camera_url: "",
    status: "online", // ✅ เพิ่มสถานะ
  });
  const [zooList, setZooList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const S = (v) => String(v ?? "");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const ip = (form.ip_address || "").trim();
    const ipRegex =
      /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

    if (!ip) return "กรุณากรอก IP";
    if (!ipRegex.test(ip)) return "รูปแบบ IP ไม่ถูกต้อง (เช่น 192.168.1.10)";
    if (!String(form.zoo_id || "").trim()) return "กรุณาเลือกสวนสัตว์";
    if (!(form.camera_position || "").trim()) return "กรุณากรอกตำแหน่งกล้อง";
    if (!(form.animal_name || "").trim()) return "กรุณากรอกชื่อสัตว์";

    if (form.camera_url?.trim()) {
      try {
        const u = new URL(form.camera_url);
        if (!/^https?:$/.test(u.protocol)) return "URL ต้องขึ้นต้นด้วย http:// หรือ https://";
      } catch {
        return "URL ต้องเป็นรูปแบบ URL ที่ถูกต้อง";
      }
    }

    if (!["online", "offline"].includes(form.status?.toLowerCase())) {
      return "กรุณาเลือกสถานะกล้อง";
    }

    return "";
  };

  useEffect(() => {
    let canceled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        // โหลดสวนสัตว์
        const resZoo = await fetch(API_ZOOS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resZoo.ok) throw new Error(`Zoos HTTP ${resZoo.status}`);
        const zooJson = await resZoo.json();
        const zoos = Array.isArray(zooJson?.data) ? zooJson.data : Array.isArray(zooJson) ? zooJson : [];
        if (!canceled) setZooList(zoos.filter((z) => z && z.id != null));

        // โหลดกล้อง
        let cam = null;
        const resCamOne = await fetch(`${API_GET_CAMERA}/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resCamOne.ok) {
          const camJson = await resCamOne.json();
          cam = camJson?.data ?? camJson ?? null;
        } else {
          const resList = await fetch(API_LIST_CAMERAS, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!resList.ok) throw new Error(`Cameras HTTP ${resList.status}`);
          const listJson = await resList.json();
          const cams = Array.isArray(listJson?.data) ? listJson.data : Array.isArray(listJson) ? listJson : [];
          cam = cams.find((c) => String(c.id ?? c.camera_id ?? c.cameraId) === String(id));
        }

        if (!cam) throw new Error("ไม่พบข้อมูลกล้องตาม ID ที่ระบุ");

        if (!canceled) {
          setForm({
            ip_address: cam.ip_address ?? "",
            zoo_id: S(cam.zoo_id ?? ""),
            camera_position: cam.camera_position ?? "",
            animal_name: cam.animal_name ?? "",
            camera_url: cam.camera_url ?? "",
            status: (cam.status ?? "online").toLowerCase(), // ✅ โหลดสถานะจาก API
          });
        }
      } catch (e) {
        if (!canceled) setError(e.message || String(e));
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    load();
    return () => {
      canceled = true;
    };
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ip_address: form.ip_address,
        zoo_id: Number(form.zoo_id),
        camera_position: form.camera_position,
        animal_name: form.animal_name,
        camera_url: form.camera_url,
        status: form.status, // ✅ ส่งสถานะ
      };

      const res = await fetch(`${API_UPDATE_CAMERA}/${(id)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `POST /cameras/${id} HTTP ${res.status}`);
      }

      setMessage("✅ อัปเดตข้อมูลกล้องสำเร็จ");
      setTimeout(() => navigate(-1), 600);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 space-y-5 border border-gray-200"
      >
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          แก้ไขข้อมูลกล้อง (ID: {id})
        </h1>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>
        )}
        {loading && <div className="text-gray-600 text-sm">⏳ กำลังโหลดข้อมูล...</div>}
        {message && (
          <div className="rounded-lg bg-green-50 text-green-700 p-3 text-sm">{message}</div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">เลขที่ IP กล้อง</label>
            <input
              type="text"
              name="ip_address"
              value={form.ip_address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoComplete="off"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">เลือกสวนสัตว์</label>
            <select
              name="zoo_id"
              value={S(form.zoo_id)}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              disabled={loading || zooList.length === 0}
              required
            >
              <option value="">{loading ? "กำลังโหลดรายชื่อ..." : "— เลือกสวนสัตว์ —"}</option>
              {zooList.map((z) => (
                <option key={z.id} value={S(z.id)}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ตำแหน่งกล้อง</label>
            <input
              name="camera_position"
              value={form.camera_position}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ชื่อสัตว์</label>
            <input
              name="animal_name"
              value={form.animal_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL กล้อง</label>
            <input
              type="url"
              name="camera_url"
              value={form.camera_url}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="http://example.com/stream"
            />
          </div>

          {/* ✅ สถานะกล้อง */}
          <div>
            <label className="block text-sm font-medium mb-1">สถานะกล้อง</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              required
            >
              <option value="online">ออนไลน์</option>
              <option value="offline">ออฟไลน์</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || saving}
            className="bg-sky-400 text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? "⏳ กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm hover:bg-gray-50 transition"
          >
            ย้อนกลับ
          </button>
        </div>
      </form>
    </div>
  );
}
