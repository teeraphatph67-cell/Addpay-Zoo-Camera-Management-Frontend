import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import ChiangMaiZooImg from "../../assets/chiangmaizoo.png";
import KhaoKheowZooImg from "../../assets/khaokheowzoo.png";
import KhonKaenZooImg from "../../assets/khonkaenzoo.png";
import NakhonRatchasimaZooImg from "../../assets/nakhonratchasimazoo.png";
import SongkhlaZooImg from "../../assets/songkhlazoo.png";
import UbonZooImg from "../../assets/ubonratchathanizoo.png";
import logo_addpay from "../../assets/logo_addpay.webp";
import zoo_of_thailand from "../../assets/zoo-0.png";

export default function Hero() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [zoos, setZoos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === "admin";
  const userZooId = user?.zoo_id;

  // รูป default ตาม ID
  const defaultImages = {
    1: KhaoKheowZooImg,
    2: ChiangMaiZooImg,
    3: NakhonRatchasimaZooImg,
    4: UbonZooImg,
    5: KhonKaenZooImg,
    6: SongkhlaZooImg,
    7: zoo_of_thailand,
    8: logo_addpay,
  };

  const getZooImage = (id) => {
    return defaultImages[id] || zoo_of_thailand;
  };

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login", { replace: true });
    return;
  }

  const fetchZoos = async () => {
    try {
      const res = await fetch(
        "https://addpay.net/api/v1/zoo/e-member/all-zoo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      let filtered = data || [];

      if (!isAdmin && userZooId) {
        filtered = filtered.filter((z) => z.id === userZooId);
      }

      setZoos(filtered);
    } catch (err) {
      console.error(err);
      setError("โหลดข้อมูลสวนสัตว์ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  fetchZoos();
}, [navigate, isAdmin, userZooId]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                zoos.length > 0
                  ? getZooImage(zoos[0].id)
                  : zoo_of_thailand
              }
              alt={zoos[0]?.name || "Zoo Logo"}
              className="w-24 h-24 object-contain rounded-3xl border border-gray-200 shadow-md"
            />

            <div>
              <h1 className="text-4xl font-extrabold text-gray-800">
                ระบบจัดการสวนสัตว์
              </h1>

              <h2 className="text-2xl font-semibold mt-2 text-gray-700">
                {isAdmin || zoos.length > 1
                  ? "สวนสัตว์ทั้งหมด"
                  : `สวนสัตว์ของคุณ : ${zoos[0]?.name || "ไม่พบข้อมูล"}`}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-center py-5">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-500 text-center">กำลังโหลดข้อมูล...</p>
      ) : zoos.length === 0 ? (
        <p className="text-gray-400 text-center py-20 text-lg">
          ยังไม่มีข้อมูลสวนสัตว์ที่คุณสามารถเข้าถึงได้
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {zoos.map((zoo) => (
            <div
              key={zoo.id}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="bg-gray-50 p-4">
                <img
                  src={getZooImage(zoo.id)}
                  alt={zoo.name}
                  className="w-full h-48 object-contain rounded-2xl transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="p-6 flex flex-col gap-3 text-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  {zoo.name || "ไม่มีชื่อสวน"}
                </h3>

                <p className="text-gray-500 text-sm md:text-base">
                  {zoo.detail_en || "ไม่มีรายละเอียดเพิ่มเติม"}
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                  <Link
                    to={`/zoo/${zoo.id}`}
                    className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:scale-105 transition"
                  >
                    ดูรายละเอียด
                  </Link>

                  <Link
                    to={`/StreamDashboard/${zoo.id}`}
                    className="px-5 py-2.5 rounded-xl font-semibold text-white bg-purple-600 hover:scale-105 transition"
                  >
                    ดูตาราง Stream
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}