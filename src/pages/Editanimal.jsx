// src/pages/EditAnimal.jsx
import React, { useEffect, useState } from "react";
import { API_IMG, API_BASE } from "../config/api";

const API_UPDATE_ANIMAL = `${API_BASE}/UpdateAnimal`;
const API_TYPE_ANIMAL = `${API_BASE}/GettypeAnimal`;

export default function EditAnimal({
  isOpen,
  onClose,
  defaultZooId,
  data,
  onSubmitSuccess,
}) {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    zoo_id: defaultZooId || "",
    animal: "",
    species: "",
    location: "",
    type_animal_id: "",
    img: null,
  });

  const [typeAnimalList, setTypeAnimalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!data) return;
    setForm({
      zoo_id: data.zoo_id || defaultZooId || "",
      animal: data.animal || "",
      species: data.species || "",
      location: data.location || "",
      type_animal_id: data.type_animal_id?.toString() || "",
      img: null,
    });
  }, [data, defaultZooId]);

  useEffect(() => {
    let canceled = false;
    async function loadTypes() {
      try {
        const res = await fetch(API_TYPE_ANIMAL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!canceled) {
          const list = Array.isArray(json?.data) ? json.data : [];
          setTypeAnimalList(list);
        }
      } catch (e) {
        console.error("loadTypes error:", e);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    loadTypes();
    return () => {
      canceled = true;
    };
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "img" && files?.[0]) {
      setForm((prev) => ({ ...prev, img: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    if (!form.zoo_id) return "กรุณาเลือกสวนสัตว์";
    if (!form.type_animal_id) return "กรุณาเลือกประเภทสัตว์";
    if (!form.animal.trim()) return "กรุณากรอกชื่อสัตว์";
    if (!form.species.trim()) return "กรุณากรอกสายพันธุ์";
    if (!form.location.trim()) return "กรุณากรอกตำแหน่ง";
    return "";
  };

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
      const formData = new FormData();
      formData.append("zoo_id", Number(form.zoo_id));
      formData.append("type_animal_id", Number(form.type_animal_id));
      formData.append("animal", form.animal);
      formData.append("species", form.species);
      formData.append("location", form.location);
      if (form.img) formData.append("img", form.img);

      const res = await fetch(`${API_UPDATE_ANIMAL}/${data.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setMessage("✅ อัปเดตสำเร็จ");
        if (onSubmitSuccess) onSubmitSuccess();
        setTimeout(() => {
          if (onClose) onClose();
        }, 500);
      } else {
        setError(json.message || "อัปเดตไม่สำเร็จ");
      }
    } catch (e) {
      console.error(e);
      setError("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-700 p-6 text-white">
          <h2 className="text-2xl font-bold">แก้ไขข้อมูลสัตว์</h2>
          <p className="text-blue-100 mt-1">แก้ไขข้อมูลสัตว์ให้ถูกต้อง</p>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form
            className="space-y-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100"
            onSubmit={handleSubmit}
          >
            {/* สวนสัตว์ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                สวนสัตว์
              </label>
              <input
                type="text"
                name="zoo_id"
                value={form.zoo_id}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm bg-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* ประเภทสัตว์ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ประเภทสัตว์
              </label>
              <select
                name="type_animal_id"
                value={form.type_animal_id}
                onChange={handleChange}
                disabled={loading || typeAnimalList.length === 0}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">— เลือกประเภทสัตว์ —</option>
                {typeAnimalList.map((t) => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.type_animal}
                  </option>
                ))}
              </select>
            </div>

            {/* ชื่อสัตว์ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ชื่อสัตว์
              </label>
              <input
                type="text"
                name="animal"
                value={form.animal}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* สายพันธุ์ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                สายพันธุ์
              </label>
              <input
                type="text"
                name="species"
                value={form.species}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* ตำแหน่ง */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ตำแหน่ง
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* รูปสัตว์ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                รูปสัตว์
              </label>
              <input
                type="file"
                name="img"
                onChange={handleChange}
                className="w-full text-gray-700"
              />
              <div className="mt-3 flex gap-3">
                {data?.img && !form.img && (
                  <img
                    src={`${API_IMG}/${data.img}`}
                    alt="animal"
                    className="w-32 h-24 object-cover rounded-lg shadow-sm border"
                  />
                )}
                {form.img && (
                  <img
                    src={URL.createObjectURL(form.img)}
                    alt="preview"
                    className="w-32 h-24 object-cover rounded-lg shadow-sm border"
                  />
                )}
              </div>
            </div>

            {/* ข้อความ error / success */}
            {error && <p className="text-red-600 font-medium">{error}</p>}
            {message && <p className="text-green-600 font-medium">{message}</p>}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-lg shadow-md hover:bg-gray-300 transition"
              >
                ยกเลิก
              </button>
              
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
