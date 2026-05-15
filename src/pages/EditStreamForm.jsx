// EditStreamForm.jsx (Modern Styled Version, Config-ready)
import React, { useEffect, useState } from "react";
import { API_IMG, API_ZOOS, API_BASE } from "../config/api";

const token = localStorage.getItem("token"); // ดึง token จาก localStorage

export default function EditStreamForm({
  initialData,
  zoo,
  zooId,
  onSuccess,
  isPopup,
}) {
  const [animals, setAnimals] = useState([]);
  const [formData, setFormData] = useState({
    zoo_id: "",
    animal_id: "",
    time_start: "",
    time_end: "",
    weekend: 0,
    stream_url: "",
    priority: 1,
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const normalizeTime = (t) => (t ? t.slice(0, 5) : "");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/GetAnimal`, {
          headers: { Authorization: "Bearer " + token },
        });
        let animalList = (await res.text()).data || [];
        if (zooId)
          animalList = animalList.filter(
            (a) => Number(a.zoo_id) === Number(zooId)
          );
        setAnimals(animalList);

        if (initialData) {
          setFormData({
            zoo_id: initialData.zoo_id,
            animal_id: initialData.animal_id,
            time_start: normalizeTime(initialData.time_start),
            time_end: normalizeTime(initialData.time_end),
            weekend: initialData.weekend ?? 0,
            stream_url: initialData.stream_url || "",
            priority: initialData.priority ?? 1,
            status: initialData.status || "active",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [initialData, zooId]);

  const timeWithSeconds = (t) => (/^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "weekend" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      zoo_id: Number(formData.zoo_id),
      animal_id: Number(formData.animal_id),
      time_start: timeWithSeconds(formData.time_start),
      time_end: timeWithSeconds(formData.time_end),
      weekend: Number(formData.weekend),
      stream_url: formData.stream_url,
      priority: Number(formData.priority),
      status: formData.status,
    };

    try {
      const res = await fetch(`${API_BASE}/UpdateStream/${initialData.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
      } else {
        if (onSuccess) onSuccess();
        
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-center">กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 p-4 pt-20 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col animate-fadeIn">
        {/* Close button */}
        {isPopup && (
          <button
            onClick={onSuccess}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold transition"
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center gap-2 p-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-blue-600 flex items-center justify-center gap-2">
            <span className="material-icons text-blue-500 text-3xl">edit</span>
            แก้ไขตาราง Live Stream
          </h1>
        </div>

        {/* Body/Form scrollable */}
        <div className="p-6 overflow-auto flex-1">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Zoo */}
            <div className="flex items-center gap-4">
              <span className="font-medium w-32 text-gray-700">สวนสัตว์:</span>
              <div className="flex-1 px-4 py-2 border rounded-xl bg-gray-100 text-gray-700 shadow-inner">
                {zoo?.name || "ไม่พบข้อมูลสวนสัตว์"}
              </div>
              <input type="hidden" name="zoo_id" value={formData.zoo_id} />
            </div>

            {/* Animal */}
            <div className="flex items-center gap-4">
              <span className="font-medium w-32 text-gray-700">สัตว์:</span>
              <select
                name="animal_id"
                value={formData.animal_id}
                onChange={handleChange}
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition hover:shadow-md"
              >
                <option value="">-- เลือกสัตว์ --</option>
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.animal}
                  </option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="block mb-2 font-medium text-gray-700">
                  เวลาเริ่ม
                </label>
                <input
                  type="time"
                  name="time_start"
                  value={formData.time_start}
                  onChange={handleChange}
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="block mb-2 font-medium text-gray-700">
                  เวลาสิ้นสุด
                </label>
                <input
                  type="time"
                  name="time_end"
                  value={formData.time_end}
                  onChange={handleChange}
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>

            {/* Day */}
            <div className="flex items-center gap-4">
              <span className="font-medium w-32 text-gray-700">วันสตรีม:</span>
              <select
                name="weekend"
                value={formData.weekend}
                onChange={handleChange}
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value={0}>ทุกวัน</option>
                <option value={1}>จันทร์</option>
                <option value={2}>อังคาร</option>
                <option value={3}>พุธ</option>
                <option value={4}>พฤหัสฯ</option>
                <option value={5}>ศุกร์</option>
                <option value={6}>เสาร์</option>
                <option value={7}>อาทิตย์</option>
              </select>
            </div>

            {/* Stream URL */}
            <div className="flex items-center gap-4">
              <span className="font-medium w-32 text-gray-700">
                Stream URL:
              </span>
              <input
                type="text"
                name="stream_url"
                value={formData.stream_url}
                onChange={handleChange}
                placeholder="https://example.com/live"
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Priority */}
            <div className="flex items-center gap-4">
              <span className="font-medium w-32 text-gray-700">ความสำคัญ:</span>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <span className="font-medium w-32 text-gray-700">สถานะ:</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"
            >
              <span className="material-icons">save</span>
              {saving ? "กำลังบันทึก..." : "อัปเดตข้อมูล"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
