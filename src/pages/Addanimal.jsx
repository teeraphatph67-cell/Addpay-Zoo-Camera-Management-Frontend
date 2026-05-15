import React, { useEffect, useState } from "react";
import { API_ZOOS, API_BASE } from "../config/api";

// รูปสวนสัตว์ local
import ChiangMaiZooImg from "../assets/chiangmaizoo.png";
import KhaoKheowZooImg from "../assets/khaokheowzoo.png";
import KhonKaenZooImg from "../assets/khonkaenzoo.png";
import NakhonRatchasimaZooImg from "../assets/nakhonratchasimazoo.png";
import SongkhlaZooImg from "../assets/songkhlazoo.png";
import UbonZooImg from "../assets/ubonratchathanizoo.png";
import logo_addpay from "../assets/logo_addpay.webp";
import zoo_of_thailand from "../assets/zoo-0.png";

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

const AddAnimal = ({ isOpen, onClose, defaultZooId, onSubmitSuccess }) => {
  const token = localStorage.getItem("token");
  const [zoos, setZoos] = useState([]);
  const [zooId, setZooId] = useState(defaultZooId || null);
  const [currentZoo, setCurrentZoo] = useState(null);
  const [species, setSpecies] = useState("");
  const [animal, setAnimal] = useState("");
  const [location, setLocation] = useState("");
  const [typeAnimalId, setTypeAnimalId] = useState(1);
  const [img, setImg] = useState(null);

  // โหลดรายการสวนสัตว์เมื่อเปิด modal
  useEffect(() => {
    if (!isOpen) return;

    fetch(API_ZOOS, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setZoos(data);
        const initialZoo =
          data.find((z) => z.id === defaultZooId) || data[0] || null;
        setZooId(initialZoo?.id || null);
        setCurrentZoo(initialZoo);
      })
      .catch((err) => console.error("Error loading zoos:", err));
  }, [isOpen, defaultZooId, token]);

  // อัปเดต currentZoo ตาม zooId
  useEffect(() => {
    if (zoos.length > 0 && zooId) {
      const zoo = zoos.find((z) => z.id === zooId) || zoos[0];
      setCurrentZoo(zoo);
    }
  }, [zooId, zoos]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!zooId || !species || !animal || !location || !typeAnimalId) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    const formData = new FormData();
    formData.append("zoo_id", zooId);
    formData.append("species", species);
    formData.append("animal", animal);
    formData.append("location", location);
    formData.append("type_animal_id", typeAnimalId);
    if (img) formData.append("img", img);

    try {
      const response = await fetch(`${API_BASE}/Addanimal`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log("API RESULT:", result);

      if (result.success) {
        alert("เพิ่มสัตว์สำเร็จ!");
        setSpecies("");
        setAnimal("");
        setLocation("");
        setTypeAnimalId(1);
        setImg(null);
        setZooId(zoos.length > 0 ? zoos[0].id : null);

        if (onSubmitSuccess) onSubmitSuccess();
        if (onClose) onClose();
      } else {
        alert("เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("ERROR:", error);
      alert("เกิดข้อผิดพลาด frontend");
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
      <h2 className="text-2xl font-bold">จัดการข้อมูลสัตว์</h2>
      <p className="text-blue-100 mt-1">
        กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
      </p>
    </div>

    {/* Form */}
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
      <h2 className="text-xl font-bold mb-4">เพิ่มสัตว์ใหม่</h2>
      <form className="space-y-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100" onSubmit={handleSubmit}>
        {/* สวนสัตว์ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            สวนสัตว์ <span className="text-red-600">*</span>
          </label>
          <select
            value={zooId}
            onChange={(e) => setZooId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">เลือกสวนสัตว์</option>
            {zoos.map((zoo) => (
              <option key={zoo.id} value={zoo.id}>
                {zoo.name}
              </option>
            ))}
          </select>
        </div>

        {/* สายพันธุ์ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ชนิดสัตว์ <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="เช่น ฮิปโปแคระ, คาปิบาร่า"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* ชื่อสัตว์ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ชื่อสัตว์ <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
            placeholder="เช่น หมูเด้ง, คาปิบาร่า"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* สถานที่ตั้ง */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ตำแหน่ง
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="เช่น ส่วนแสดงใจกลางสวน"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* ประเภทสัตว์ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ประเภทสัตว์
          </label>
          <select
            value={typeAnimalId}
            onChange={(e) => setTypeAnimalId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value={1}>ดาวเด่น</option>
            <option value={2}>ทั่วไป</option>
          </select>
        </div>

        {/* รูปภาพ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            รูปภาพ
          </label>
          <input
            type="file"
            onChange={(e) => setImg(e.target.files[0])}
            className="w-full text-gray-700"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            บันทึกข้อมูล
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
};

export default AddAnimal;
