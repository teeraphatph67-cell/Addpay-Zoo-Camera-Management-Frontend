import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CameraDetail from "./CameraDetail";
import AddAnimal from "./Addanimal";
import Editanimal from "../pages/Editanimal";
import { API_IMG, API_ZOOS, API_BASE } from "../config/api";


// รูปสวนสัตว์
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

export default function ZooAndCameraDetail() {
  const { id } = useParams();

  const apiKey = localStorage.getItem("api_key");
  const token = localStorage.getItem("token"); //token

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const [editAnimal, setEditAnimal] = useState(null);
  const [zoo, setZoo] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [errCams, setErrCams] = useState("");
  const [loadingCams, setLoadingCams] = useState(true);
  const [zoosList, setZoosList] = useState([]);
  const [popupCamera, setPopupCamera] = useState(null);
  const [showAddAnimal, setShowAddAnimal] = useState(false);

  const getAnimalImage = (imgPath) => {
    if (!imgPath)
      return "https://dummyimage.com/400x200/cccccc/000000&text=Animal";
    const cleanPath = imgPath.replace(/^\/?public\/?/, "");

    return `${API_IMG}/${cleanPath}`;
  };

  // โหลด cameras และ zoo
  const loadCamsAndZoo = async () => {
    setLoadingCams(true);
    setErrCams("");
    try {
      const [resZoo, resCam] = await Promise.all([
        fetch(API_ZOOS, { headers: { Authorization: `Bearer ${apiKey}` } }),
        fetch(API_BASE + "/GetAnimalCameraStream", {
          headers: { Authorization: `Bearer ${token}` },
        }), //token
      ]);

      if (!resZoo.ok) throw new Error(`Zoo HTTP ${resZoo.status}`);
      if (!resCam.ok) throw new Error(`Camera HTTP ${resCam.status}`);

      const zooJson = await resZoo.json();
      const camJson = await resCam.json();

      const zoos = Array.isArray(zooJson?.data) ? zooJson.data : zooJson;
      const currentZoo = zoos.find((z) => String(z.id) === String(id)) || null;
      setZoo(currentZoo);

      const cams = Array.isArray(camJson?.data)
        ? camJson.data.map((animal) => ({
            ...animal,
            animal_name: animal.animal || "-",
            animal_type: animal.type_animal?.type_animal || "-",
            cameras: animal.cameras || [],
            camera_position: animal.location || "-",
            animal_image: getAnimalImage(animal.img),
            zoo_id: animal.zoo_id,
          }))
        : [];

      setCameras(cams.filter((c) => Number(c.zoo_id) === Number(id)));
    } catch (e) {
      setErrCams(e.message || String(e));
    } finally {
      setLoadingCams(false);
    }
  };

  // โหลดข้อมูลตอน mount
  useEffect(() => {
    loadCamsAndZoo();
  }, [id, apiKey]);

  // โหลด zoos list
  useEffect(() => {
    const loadZoos = async () => {
      try {
        const res = await fetch(API_ZOOS, {
          headers: { Authorization: `Bearer ${apiKey}` }, //token
        });
        const data = await res.json();
        setZoosList(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {}
    };
    loadZoos();
  }, [apiKey]);

  if (loadingCams)
    return (
      <p className="text-gray-600 p-4 text-center animate-pulse">
        ⏳ กำลังโหลดข้อมูล...
      </p>
    );
  if (errCams)
    return (
      <p className="text-red-600 p-4 text-center">
        ❌ เกิดข้อผิดพลาด: {errCams}
      </p>
    );
  if (!zoo)
    return (
      <p className="text-gray-600 p-4 text-center">ไม่พบข้อมูลสวนสัตว์นี้</p>
    );

  const zooImage = getZooImage(zoo.id);

  return (
    <main>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <img
            src={zooImage}
            alt={zoo.name}
            className="w-24 h-24 object-contain rounded-3xl border border-gray-200 shadow-md"
          />
          <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm flex items-center gap-2">
            <span className="material-icons text-blue-500 text-5xl">
              photo_camera
            </span>
            {zoo.name}
          </h1>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Link to={`/Managecamera/${zoo.id}`}>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-400 to-sky-700 shadow-md hover:scale-105 hover:brightness-110 transition-all">
              <span className="material-icons">edit</span>
              จัดการกล้อง
            </button>
          </Link>
          {isAdmin && (
            <button
              onClick={() => setShowAddAnimal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 to-sky-700 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:scale-105 hover:brightness-110 transition-all"
            >
              <span className="material-icons">add_a_photo</span>
              เพิ่มสัตว์
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-4 mb-10">
        <div className="bg-white border border-green-200 text-green-700 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
          <span className="material-icons text-4xl text-green-500">pets</span>
          <div>
            <p className="text-sm font-medium">จำนวนสัตว์ทั้งหมด</p>
            <p className="text-2xl font-bold">{cameras.length}</p>
          </div>
        </div>

        <div className="bg-white border border-blue-200 text-blue-700 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
          <span className="material-icons text-4xl text-blue-500">
            videocam
          </span>
          <div>
            <p className="text-sm font-medium">กล้องออนไลน์</p>
            <p className="text-2xl font-bold">
              {cameras.reduce(
                (acc, animal) =>
                  acc +
                  (animal.cameras?.filter((c) => c.status === "ออนไลน์")
                    .length || 0),
                0
              )}
              /
              {cameras.reduce(
                (acc, animal) => acc + (animal.cameras?.length || 0),
                0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cameras.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">
            ไม่มีกล้องในสวนสัตว์นี้
          </p>
        ) : (
          cameras.map((cam, idx) => (
            <div
              key={cam.id || idx}
              className="bg-white rounded-3xl shadow-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="relative group">
                <img
                  src={API_IMG + cam.img}
                  alt={cam.animal_name || cam.name}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://dummyimage.com/400x200/cccccc/000000&text=Animal")
                  }
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {cam.cameras?.some((c) => c.status === "online") && (
                  <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-md font-medium">
                    Online
                  </span>
                )}

                {/* อัปโหลดรูป (Admin) */}
                {isAdmin && (
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="คลิกเพื่ออัปโหลดรูป"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const updatedCams = [...cameras];
                        updatedCams[idx] = {
                          ...updatedCams[idx],
                          animal_image: URL.createObjectURL(file),
                          _file: file,
                        };
                        setCameras(updatedCams);
                      }
                    }}
                  />
                )}
              </div>

              {/* ข้อมูลสัตว์ */}
              <div className="p-6 flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-icons text-blue-500">pets</span>
                  {cam.animal_name || cam.name}
                </h3>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <span className="material-icons text-gray-400 text-base">
                    category
                  </span>
                  ประเภท: {cam.animal_type || "-"}
                </p>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <span className="material-icons text-gray-400 text-base">
                    place
                  </span>
                  ตำแหน่ง: {cam.camera_position || "-"}
                </p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setPopupCamera(cam)}
                    className="flex-1 bg-gradient-to-r from-sky-400 to-sky-700 text-white py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span className="material-icons">videocam</span> ดูกล้อง
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setEditAnimal(cam)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-400 to-sky-700 shadow-md hover:scale-105 hover:brightness-110 transition-all"
                    >
                      <span className="material-icons">edit</span>
                      แก้ไข
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Popup Camera */}
      {popupCamera && (
        <CameraDetail
          animal={popupCamera}
          onClose={() => setPopupCamera(null)}
        />
      )}

      {/* Popup AddAnimal */}
      {showAddAnimal && (
        <AddAnimal
          isOpen={showAddAnimal}
          onClose={() => setShowAddAnimal(false)}
          defaultZooId={zoo.id}
          zoosList={zoosList}
          onSubmitSuccess={loadCamsAndZoo} // ✅ รีโหลดทันที
        />
      )}

      {/* Popup EditAnimal */}
      {editAnimal && (
        <Editanimal
          isOpen={!!editAnimal}
          onClose={() => setEditAnimal(null)}
          defaultZooId={zoo.id}
          data={editAnimal}
          zoosList={zoosList}
          onSubmitSuccess={loadCamsAndZoo} // ✅ รีโหลดทันที
        />
      )}
    </main>
  );
}
