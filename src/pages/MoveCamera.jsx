// src/components/MoveCameraPopup.jsx
import { useEffect, useState } from "react";
import { API_ZOOS, API_BASE } from "../config/api";

export default function MoveCameraPopup({
  isOpen,
  onClose,
  camera,
  onSubmitSuccess,
}) {
  const token = localStorage.getItem("token"); // token
  const [animals, setAnimals] = useState([]);
  const [zoos, setZoos] = useState([]);
  const [selectedZooId, setSelectedZooId] = useState(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // โหลดสวนสัตว์
  useEffect(() => {
    const fetchZoos = async () => {
      try {
        const res = await fetch(API_ZOOS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const list = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        setZoos(list.filter((z) => z && z.id != null));
      } catch (err) {
        console.error("โหลดสวนสัตว์ล้มเหลว:", err);
      }
    };
    fetchZoos();
  }, [token]);

  // โหลดสัตว์
  useEffect(() => {
    if (!isOpen) return;
    const fetchAnimals = async () => {
      try {
        const res = await fetch(`${API_BASE}/GetAnimal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setAnimals(json.data ?? []);
        else setMessage(json.message || "โหลดข้อมูลสัตว์ไม่สำเร็จ");
      } catch (err) {
        console.error(err);
        setMessage("เกิดข้อผิดพลาดในการโหลดข้อมูลสัตว์");
      }
    };
    fetchAnimals();
  }, [isOpen, token]);

  // Filter animals ตามสวนสัตว์
  const filteredAnimals =
    selectedZooId == null
      ? animals
      : animals.filter((a) => a.zoo_id === selectedZooId);

  const handleMove = async () => {
    if (!selectedAnimalId) {
      setMessage("⚠️ กรุณาเลือกสัตว์ปลายทางก่อน");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/MoveCamera/${camera.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ animal_id: selectedAnimalId }),
      });

      const json = await res.json();

      if (json.success) {
        setMessage("✅ ย้ายกล้องสำเร็จ");

        if (onSubmitSuccess) await onSubmitSuccess(); // รีเฟรชข้อมูล parent

        if (onClose) onClose(); // ปิด popup
      } else {
        setMessage(json.message || "❌ อัปเดตไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ เกิดข้อผิดพลาดในการย้ายกล้อง");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
  <div
    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 relative overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ปิด popup */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-3xl font-bold"
      >
        &times;
      </button>

      <h2 className="text-2xl font-bold text-gray-800 text-center">
        ย้ายกล้อง:{" "}
        <span className="text-gradient bg-gradient-to-r from-sky-400 to-sky-700 bg-clip-text text-transparent">
          {camera.camera_name}
        </span>
      </h2>

      {/* เลือกสวนสัตว์ */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-gray-700">สวนสัตว์</label>
        <select
          value={selectedZooId ?? ""}
          onChange={(e) =>
            setSelectedZooId(
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
          className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 transition shadow-sm"
        >
          <option value="">ทั้งหมด</option>
          {zoos.map((zoo) => (
            <option key={zoo.id} value={zoo.id}>
              {zoo.name || `สวนสัตว์ #${zoo.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* เลือกสัตว์ */}
      <div className="flex flex-col gap-2">
        <label className="font-medium text-gray-700">สัตว์ปลายทาง</label>
        <select
          value={selectedAnimalId ?? ""}
          onChange={(e) =>
            setSelectedAnimalId(
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
          className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 transition shadow-sm"
        >
          <option value="">-- เลือกสัตว์ --</option>
          {filteredAnimals.map((ani) => {
            const zooName =
              zoos.find((z) => z.id === ani.zoo_id)?.name || `Zoo ${ani.zoo_id}`;
            return (
              <option key={ani.id} value={ani.id}>
                [{zooName}] {ani.animal} ({ani.species}) - {ani.location}
              </option>
            );
          })}
        </select>
      </div>

      {/* ปุ่มย้ายกล้อง */}
      <button
        onClick={handleMove}
        disabled={loading}
        className="mt-6 w-full bg-gradient-to-r from-sky-400 to-sky-700 text-white px-4 py-3 rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:scale-105 hover:brightness-110 transition-all"
      >
        {loading ? "⏳ กำลังย้าย..." : "ย้ายกล้อง"}
      </button>

      {/* ข้อความสถานะ */}
      {message && (
        <div
          className={`p-3 rounded-xl text-center font-medium ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  </div>
);

}
