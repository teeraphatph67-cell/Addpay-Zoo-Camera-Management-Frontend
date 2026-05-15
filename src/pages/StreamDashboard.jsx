import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StreamForm from "./StreamForm";
import EditAnimal from "./EditStreamForm";
import { API_IMG, API_ZOOS, API_BASE } from "../config/api";
import NotificationPopup from "./NotificationPopup"; // เพิ่ม import

const token = localStorage.getItem("token");

// Zoo images (คงเดิม)
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

// Helpers (คงเดิม)
function mapWeekendToText(value) {
  if (value === 0 || value === "0" || value == null) return "ทุกวัน";
  const num = Number(value);
  switch (num) {
    case 1:
      return "จันทร์";
    case 2:
      return "อังคาร";
    case 3:
      return "พุธ";
    case 4:
      return "พฤหัสฯ";
    case 5:
      return "ศุกร์";
    case 6:
      return "เสาร์";
    case 7:
      return "อาทิตย์";
    default:
      return `(${value})`;
  }
}

function formatTime(t) {
  if (!t) return "-";
  return t.slice(0, 5);
}

const typeBadge = (typeName) => {
  switch (typeName) {
    case "ดาวเด่น":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 shadow-sm">
          ⭐ {typeName}
        </span>
      );
    case "ทั่วไป":
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 shadow-sm">
          🐾 {typeName}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 shadow-sm">
          {typeName || "ไม่ระบุ"}
        </span>
      );
  }
};

export default function StreamDashboard() {
  const [streams, setStreams] = useState([]);
  const [animalMap, setAnimalMap] = useState({});
  const [cameras, setCameras] = useState([]);
  const [zoo, setZoo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [editPopup, setEditPopup] = useState({ show: false, streamData: null });

  // เพิ่ม state สำหรับ notification
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: ""
  });

  const { zooId } = useParams();

  // ฟังก์ชันแสดง notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, type: "success", message: "" });
  };

  // ฟังก์ชัน reloadStreams สำหรับใช้หลังเพิ่ม/แก้ไข
  const reloadStreams = async () => {
    try {
      const res = await fetch(API_BASE + "/GetStream", {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("โหลด streams ไม่สำเร็จ:", text);
        return;
      }

      const data = await res.json();
      let list = data.data || data || [];
      if (zooId) list = list.filter((s) => Number(s.zoo_id) === Number(zooId));
      setStreams(list);
    } catch (err) {
      console.error("โหลด streams ไม่สำเร็จ:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [streamRes, animalRes, typeRes, zooRes, cameraRes] =
          await Promise.all([
            fetch(API_BASE + "/GetStream", {
              headers: { Authorization: "Bearer " + token },
            }),
            fetch(API_BASE + "/GetAnimal", {
              headers: { Authorization: "Bearer " + token },
            }),
            fetch(API_BASE + "/GettypeAnimal", {
              headers: { Authorization: "Bearer " + token },
            }),
            fetch(API_ZOOS, {
              headers: { Authorization: "Bearer " + token },
            }),
            fetch(API_BASE + "/GetcameraAnimal", {
              headers: { Authorization: "Bearer " + token },
            }),
          ]);

        const [streamJson, animalJson, typeJson, zooJson, cameraJson] =
          await Promise.all([
            streamRes.json(),
            animalRes.json(),
            typeRes.json(),
            zooRes.json(),
            cameraRes.json(),
          ]);

        // Streams
        let streamList = streamJson.data || streamJson || [];
        if (zooId)
          streamList = streamList.filter(
            (s) => Number(s.zoo_id) === Number(zooId)
          );
        setStreams(streamList);

        // Animals
        const animalList = animalJson.data || animalJson || [];
        const typeList = typeJson.data || typeJson || [];
        const typeMap = {};
        typeList.forEach((t) => (typeMap[t.id] = t.type_animal));
        const map = {};
        animalList.forEach((a) => {
          map[a.id] = {
            name: a.animal,
            species: a.species,
            position: a.location,
            image: a.img ? `${API_IMG}/${a.img}` : null,
            type: typeMap[a.type_animal_id] || "ไม่ระบุ",
            zoo_id: a.zoo_id,
          };
        });
        setAnimalMap(map);

        // Zoo
        const zooList = zooJson.data || zooJson || [];
        const found = zooList.find((z) => String(z.id) === String(zooId));
        setZoo(found || null);

        // Cameras
        let camList = cameraJson.data || cameraJson || [];
        if (zooId)
          camList = camList.filter((c) => String(c.zoo_id) === String(zooId));
        setCameras(camList);
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [zooId]);

  const livePath = zooId ? `/StreamLive/${zooId}` : "/StreamLive";

  const getAnimalInfo = (animal_id) =>
    animalMap[animal_id] || {
      name: `Animal ID: ${animal_id}`,
      species: "-",
      position: "-",
      image: null,
      type: "ไม่ระบุ",
    };

  const handleDelete = async (id) => {
    const stream = streams.find(s => s.id === id);
    const animalInfo = getAnimalInfo(stream?.animal_id);

    if (!window.confirm(`ต้องการลบสตรีมของสัตว์ "${animalInfo.name}" ใช่ไหม?`)) return;

    try {
      const res = await fetch(`${API_BASE}/Stream/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        showNotification("error", "ลบข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
        return;
      }

      setStreams((prev) => prev.filter((s) => s.id !== id));
      showNotification("success", `ลบสตรีมของสัตว์ "${animalInfo.name}" เรียบร้อยแล้ว`);
    } catch (err) {
      console.error(err);
      showNotification("error", "เกิดข้อผิดพลาดในการลบ กรุณาลองอีกครั้ง");
    }
  };

  const zooImage = getZooImage(zoo?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10">
      {/* Notification Popup */}
      {notification.show && (
        <NotificationPopup
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
          duration={3000}
        />
      )}

      {/* Header (คงเดิม) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left w-full justify-center md:justify-start">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-3xl blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
            <img
              src={zooImage}
              alt={zoo ? zoo.name : "สวนสัตว์"}
              className="relative w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-3xl border-2 border-white shadow-lg transform transition-transform duration-300 group-hover:scale-110 z-10"
            />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-800 flex items-center gap-2 sm:gap-3">
              <span className="material-icons text-indigo-500 text-3xl sm:text-5xl">
                photo_camera
              </span>
              {zoo ? zoo.name : "ไม่พบชื่อสวนสัตว์"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">ระบบจัดการกล้องสตรีมมิ่งสัตว์</p>
          </div>
        </div>
      </div>

      {/* Summary & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
          <div className="bg-white border border-green-200 text-green-700 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-lg hover:scale-105 transition-transform duration-300 min-w-[160px]">
            <span className="material-icons text-2xl sm:text-4xl text-green-500">pets</span>
            <div>
              <p className="text-xs sm:text-sm font-medium">จำนวนสัตว์ทั้งหมด</p>
              <p className="text-xl sm:text-2xl font-bold">{cameras.length}</p>
            </div>
          </div>

          <div className="bg-white border border-blue-200 text-blue-700 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-lg hover:scale-105 transition-transform duration-300 min-w-[160px]">
            <span className="material-icons text-2xl sm:text-4xl text-blue-500">videocam</span>
            <div>
              <p className="text-xs sm:text-sm font-medium">กล้องออนไลน์</p>
              <p className="text-xl sm:text-2xl font-bold">
                {streams.filter((s) => s.status === "active").length}/
                {streams.length}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - อัพเดทปุ่มให้สวยขึ้น */}
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
          <Link
            to={livePath}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl bg-gradient-to-r from-sky-400 to-sky-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium text-sm sm:text-base w-full sm:w-auto justify-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="material-icons text-sm">videocam</span>
            <span>ดู Live</span>
          </Link>
          <button
            onClick={() => setShowPopup(true)}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium text-sm sm:text-base w-full sm:w-auto justify-center group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="material-icons text-sm">add</span>
            <span>เพิ่มตาราง</span>
          </button>
        </div>
      </div>

      {/* Stream Table - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-slide-in-up">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-sky-400 to-sky-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left">สัตว์</th>
                <th className="px-4 py-3 text-left">สายพันธุ์</th>
                <th className="px-4 py-3 text-left">ตำแหน่ง</th>
                <th className="px-4 py-3 text-left">วัน</th>
                <th className="px-4 py-3 text-left">เวลา</th>
                <th className="px-4 py-3 text-left">สถานะ</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {streams.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    ยังไม่มีข้อมูลสตรีม
                  </td>
                </tr>
              ) : (
                streams.map((s) => {
                  const info = getAnimalInfo(s.animal_id);
                  const isActive = s.status === "active";
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 flex items-center gap-3">
                        {info.image ? (
                          <img
                            src={info.image}
                            alt={info.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                            No Img
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">
                            {info.name}
                          </span>
                          {typeBadge(info.type)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {info.species}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {info.position}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {mapWeekendToText(s.weekend)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatTime(s.time_start)} - {formatTime(s.time_end)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-emerald-500" : "bg-red-500"
                              }`}
                          ></span>
                          {isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center flex justify-center gap-4">
                        <button
                          onClick={() =>
                            setEditPopup({ show: true, streamData: s })
                          }
                          className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-medium flex items-center gap-1 group"
                        >
                          <span className="material-icons text-base group-hover:scale-110 transition-transform">
                            edit
                          </span>
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:text-red-800 hover:underline transition-colors font-medium flex items-center gap-1 group"
                        >
                          <span className="material-icons text-base group-hover:scale-110 transition-transform">
                            delete
                          </span>
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stream Cards - Mobile */}
      <div className="md:hidden space-y-4 animate-fade-in">
        {streams.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-500 shadow-lg border border-gray-100">
            ยังไม่มีข้อมูลสตรีม
          </div>
        ) : (
          streams.map((s) => {
            const info = getAnimalInfo(s.animal_id);
            const isActive = s.status === "active";
            return (
              <div key={s.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-shadow duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  {info.image ? (
                    <img
                      src={info.image}
                      alt={info.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      No Img
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {info.name}
                      </h3>
                      {typeBadge(info.type)}
                    </div>
                    <p className="text-sm text-gray-600">{info.species}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-emerald-500" : "bg-red-500"
                        }`}
                    ></span>
                    {isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">ตำแหน่ง</p>
                    <p className="font-medium text-gray-800">{info.position}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">วัน</p>
                    <p className="font-medium text-gray-800">{mapWeekendToText(s.weekend)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">เวลา</p>
                    <p className="font-medium text-gray-800">
                      {formatTime(s.time_start)} - {formatTime(s.time_end)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setEditPopup({ show: true, streamData: s })}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <span className="material-icons text-sm">edit</span>
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:text-red-800 hover:underline transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <span className="material-icons text-sm">delete</span>
                    ลบ
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Popup Add */}
     {/* Popup Add */}
{showPopup && (
  <div
    className="fixed inset-0 bg-black/40 flex justify-center items-start z-50 p-4 overflow-auto backdrop-blur-sm"
    onClick={() => setShowPopup(false)}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 border border-gray-200 mt-10 sm:mt-20 animate-popup-in"
      onClick={(e) => e.stopPropagation()}
    >
      <StreamForm
        zoo={zoo}
        initialData={{ zoo_id: zoo?.id }}
        onSuccess={() => {
          setShowPopup(false);
          reloadStreams();
          showNotification("success", "เพิ่มข้อมูลสำเร็จแล้ว!");
        }}
        onCancel={() => {
          setShowPopup(false);
          
        }}
        isPopup={true}
      />
    </div>
  </div>
)}

      {/* Edit Popup */}
     {/* Edit Popup */}
{editPopup.show && (
  <div
    className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
    onClick={() => setEditPopup({ show: false, streamData: null })}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] p-4 sm:p-6 overflow-auto animate-popup-in"
      onClick={(e) => e.stopPropagation()}
    >
      <EditAnimal
        key={editPopup.streamData?.id}
        initialData={editPopup.streamData}
        zoo={zoo}
        zooId={zoo?.id}
        onSuccess={() => {
          setEditPopup({ show: false, streamData: null });
          reloadStreams();
          showNotification("success", "แก้ไขข้อมูลสำเร็จแล้ว!");
        }}
        onCancel={() => {
          setEditPopup({ show: false, streamData: null });
          // ไม่แสดง notification เมื่อยกเลิก
        }}
        isPopup={true}
      />
    </div>
  </div>
)}
    </div>
  );
}