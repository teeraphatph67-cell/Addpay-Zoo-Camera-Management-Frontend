// StreamForm.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChiangMaiZooImg from "../assets/chiangmaizoo.png";
import KhaoKheowZooImg from "../assets/khaokheowzoo.png";
import KhonKaenZooImg from "../assets/khonkaenzoo.png";
import NakhonRatchasimaZooImg from "../assets/nakhonratchasimazoo.png";
import SongkhlaZooImg from "../assets/songkhlazoo.png";
import UbonZooImg from "../assets/ubonratchathanizoo.png";
import logo_addpay from "../assets/logo_addpay.webp";
import zoo_of_thailand from "../assets/zoo-0.png";

import { API_IMG, API_ZOOS, API_BASE } from "../config/api";
const token = localStorage.getItem("token"); //token

const zooImages = {
  1: KhaoKheowZooImg,
  2: ChiangMaiZooImg,
  3: NakhonRatchasimaZooImg,
  4: UbonZooImg,
  5: KhonKaenZooImg,
  6: SongkhlaZooImg,
  7: zoo_of_thailand,
  8: logo_addpay,
};

const getZooImage = (zooId) => zooImages[zooId] || ChiangMaiZooImg;

function StreamForm({ initialData = null, onSuccess, isPopup = false }) {
  const { zooId } = useParams();

  const [zoos, setZoos] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    zoo_id: initialData?.zoo_id || zooId || "",
    animal_id: initialData?.animal_id || "",
    time_start: initialData?.time_start || "",
    time_end: initialData?.time_end || "",
    weekend: initialData?.weekend ?? 0,
    stream_url: initialData?.stream_url || "",
    priority: initialData?.priority ?? 1,
    status: initialData?.status || "active",
  });

  useEffect(() => {
    const fetchZoos = async () => {
      try {
        const res = await fetch(API_ZOOS, {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        let list = data.data || data.zoos || data || [];

        list = list.map((z) => ({
          id: z.id || z.zoo_id || z.zooId || z.id_zoo,
          name: z.name || z.zoo_name || z.zoo || z.name_zoo,
        }));

        setZoos(list);
      } catch (err) {
        console.error("Error loading zoos:", err);
      }
    };

    const fetchAnimals = async () => {
      try {
        const res = await fetch(API_BASE + "/GetAnimal", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        let list = data.data || [];

        if (zooId) {
          list = list.filter((a) => Number(a.zoo_id) === Number(zooId));
        }

        setAnimals(list);
      } catch (err) {
        console.error("Error loading animals:", err);
      }
    };

    fetchZoos();
    fetchAnimals();
  }, [zooId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "weekend") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toTimeWithSeconds = (time) => {
    if (!time) return null;
    return /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // ป้องกัน submit ซ้ำ
    setLoading(true);

    const payload = {
      zoo_id: Number(formData.zoo_id),
      animal_id: Number(formData.animal_id),
      time_start: toTimeWithSeconds(formData.time_start),
      time_end: toTimeWithSeconds(formData.time_end),
      weekend: Number(formData.weekend),
      stream_url: formData.stream_url,
      priority: Number(formData.priority),
      status: formData.status,
    };

    try {
      const res = await fetch(API_BASE + "/Addstream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Addstream failed");

     
      if (isPopup && onSuccess) onSuccess();
      else
        setTimeout(
          () => (window.location.href = `/StreamDashboard/${formData.zoo_id}`),
          1000
        );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      
    }
  };

  const selectedZoo = zoos.find(
    (z) => Number(z.id) === Number(formData.zoo_id)
  );
return (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
    <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] animate-fadeIn">
      
      {/* Close Button */}
      {isPopup && (
        <button
          onClick={onSuccess}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl transition font-semibold"
        >
          ✕
        </button>
      )}

      {/* Header ค้างบน */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-4">
          <img
            src={getZooImage(selectedZoo?.id)}
            alt={selectedZoo?.name || "สวนสัตว์"}
            className="w-24 h-24 object-cover rounded-2xl border border-gray-200 shadow-md"
          />
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-purple-700 bg-clip-text text-transparent">
            {selectedZoo?.name || "ไม่พบชื่อสวนสัตว์"}
          </h2>
        </div>
      </div>

      {/* Body/Form scrollable */}
      <div className="p-6 overflow-auto flex-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              สัตว์
            </label>
            <select
              name="animal_id"
              value={formData.animal_id}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">-- เลือกสัตว์ --</option>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.animal} (ID: {a.id})
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                เวลาเริ่ม
              </label>
              <input
                type="time"
                name="time_start"
                value={formData.time_start}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                name="time_end"
                value={formData.time_end}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Day */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              วันสตรีม
            </label>
            <select
              name="weekend"
              value={formData.weekend}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  weekend: Number(e.target.value),
                }))
              }
              className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
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
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Stream URL
            </label>
            <input
              type="text"
              name="stream_url"
              value={formData.stream_url}
              onChange={handleChange}
              placeholder="https://example.com/live"
              required
              className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl font-semibold text-white shadow-lg bg-gradient-to-r from-sky-400 to-purple-700 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span className="material-icons">save</span>
              {loading ? "กำลังบันทึก..." : "บันทึกตารางสตรีม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh] animate-fadeIn">
        {/* Close Button */}
        {isPopup && (
          <button
            onClick={onSuccess}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl transition font-semibold"
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={getZooImage(selectedZoo?.id)}
              alt={selectedZoo?.name || "สวนสัตว์"}
              className="w-24 h-24 object-cover rounded-2xl border border-gray-200 shadow-md"
            />
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-purple-700 bg-clip-text text-transparent">
              {selectedZoo?.name || "ไม่พบชื่อสวนสัตว์"}
            </h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              สัตว์
            </label>
            <select
              name="animal_id"
              value={formData.animal_id}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">-- เลือกสัตว์ --</option>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.animal} (ID: {a.id})
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                เวลาเริ่ม
              </label>
              <input
                type="time"
                name="time_start"
                value={formData.time_start}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                name="time_end"
                value={formData.time_end}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Day */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              วันสตรีม
            </label>
            <select
              name="weekend"
              value={formData.weekend}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  weekend: Number(e.target.value),
                }))
              }
              className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
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
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Stream URL
            </label>
            <input
              type="text"
              name="stream_url"
              value={formData.stream_url}
              onChange={handleChange}
              placeholder="https://example.com/live"
              required
              className="w-full rounded-2xl border border-gray-200 p-3 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl font-semibold text-white shadow-lg bg-gradient-to-r from-sky-400 to-purple-700 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span className="material-icons">save</span>
              {loading ? "กำลังบันทึก..." : "บันทึกตารางสตรีม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StreamForm;
