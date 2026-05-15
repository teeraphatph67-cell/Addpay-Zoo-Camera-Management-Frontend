import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import AddCamera from "./AddCamera";
import MoveCameraPopup from "./MoveCamera"; // import popup
import { API_IMG, API_ZOOS, API_BASE } from "../config/api";
import { Wifi, WifiOff } from "lucide-react";

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

const getZooImage = (zooId) =>
  zooImages[zooId] || `https://via.placeholder.com/120.png?text=Zoo+${zooId}`;

export default function ManageCamera() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const isAdmin = user?.role === "admin";
  const [zoo, setZoo] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [currentAnimal, setCurrentAnimal] = useState(null);
  const [showMovePopup, setShowMovePopup] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const token = localStorage.getItem("token");
  const cameras = animals.flatMap((animal) => animal.cameras || []);
  const onlineCount = cameras.filter(
    (c) =>
      (c.status || "").toLowerCase() === "online" ||
      (c.status || "").trim() === "ออนไลน์"
  ).length;
  // โหลดข้อมูลสวนสัตว์และสัตว์
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErr("");
      try {
        // Fetch zoo
        const zooRes = await fetch(API_ZOOS, {headers: { Authorization: `Bearer ${token}` },});
        if (!zooRes.ok) throw new Error(`HTTP ERROR ${zooRes.status}`);
        const zooJson = await zooRes.json();
        const selectedZoo =
          zooJson.find((z) => String(z.id) === String(id)) || null;
        setZoo(selectedZoo);

        // Fetch animals + cameras
        const animalRes = await fetch(`${API_BASE}/GetcameraAnimal`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!animalRes.ok) throw new Error(`HTTP ERROR ${animalRes.status}`);
        const animalJson = await animalRes.json();
        const animalsArray = Array.isArray(animalJson.data)
          ? animalJson.data
          : Array.isArray(animalJson)
          ? animalJson
          : [];
        const filteredAnimals = animalsArray.filter(
          (a) => String(a.zoo_id) === String(id)
        );
        setAnimals(filteredAnimals);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, token]);

  const handleOpenAdd = (animal) => {
    setCurrentAnimal(animal);
    setEditingCamera(null);
    setShowForm(true);
  };

  const handleOpenEdit = (camera, animal) => {
    setEditingCamera(camera);
    setCurrentAnimal(animal);
    setShowForm(true);
  };

  const handleDeleteCamera = async (camId) => {
    if (!window.confirm("ลบกล้องนี้หรือไม่?")) return;
    try {
      await fetch(API_BASE + "/cameras/" + camId, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnimals((prev) =>
        prev.map((ani) => ({
          ...ani,
          cameras: ani.cameras?.filter((c) => c.id !== camId),
        }))
      );
    } catch (err) {
      alert("❌ ลบไม่สำเร็จ");
    }
  };

  if (loading)
    return (
      <p className="text-center p-4 animate-pulse text-gray-600">
        ⏳ กำลังโหลดข้อมูล...
      </p>
    );

  if (err)
    return <p className="text-center p-4 text-red-600">❌ ERROR: {err}</p>;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <img
            src={zoo ? getZooImage(zoo.id) : ChiangMaiZooImg}
            alt={zoo?.name || `สวนสัตว์ #${id}`}
            className="w-24 h-24 object-contain rounded-3xl border border-gray-200 shadow-md"
          />
          <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-2">
            <span className="material-icons text-blue-500 text-5xl">
              photo_camera
            </span>
            จัดการกล้องของ : {zoo?.name || `สวนสัตว์ #${id}`}
          </h1>
          
        </div>
      </div>
      {/* //Summary */}
      <div className="flex flex-wrap gap-4 mb-10">
        <div className="bg-white border border-green-200 text-green-700 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
          <span className="material-icons text-4xl text-green-500">pets</span>
          <div>
            <p className="text-sm font-medium">จำนวนกล้องทั้งหมด</p>
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
              {onlineCount}/{cameras.length}
            </p>
          </div>
        </div>
      </div>
      {/* Animals */}
      <div className="flex flex-col gap-10">
        {animals.length === 0 ? (
          <p className="text-gray-400 italic text-center py-10">
            ไม่มีสัตว์ในสวนสัตว์นี้
          </p>
        ) : (
          animals.map((animal) => (
            <div
              key={animal.id}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Animal Header */}
              <div className="bg-gradient-to-r from-sky-400 to-sky-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      animal?.img
                        ? API_IMG + animal.img
                        : "https://dummyimage.com/120x120/cccccc/000000&text=Animal"
                    }
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://dummyimage.com/120x120/cccccc/000000&text=Animal")
                    }
                    className="w-28 h-28 object-cover rounded-2xl border shadow-sm"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{animal.animal}</h2>
                    <p className="text-indigo-200 mt-1">
                      ชนิด: {animal.species || "-"}
                    </p>
                    {animal.location && (
                      <p className="text-indigo-100 mt-1 text-sm">
                        {animal.location}
                      </p>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenAdd(animal)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold px-5 py-2 rounded-xl shadow-lg hover:scale-105 hover:brightness-110 transition-all"
                  >
                    <span className="material-icons text-lg">add</span>{" "}
                    เพิ่มกล้อง
                  </button>
                )}
              </div>

              {/* Cameras Section */}
              <div className="p-6 bg-gradient-to-b from-blue-50 to-purple-50 border-t border-gray-200">
                {animal.cameras?.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>ยังไม่มีกล้องสำหรับสัตว์นี้</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {animal.cameras.map((cam) => (
                      <div
                        key={cam.id}
                        className="bg-white rounded-2xl p-5 border border-gray-200 shadow-md flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h5 className="font-bold text-lg text-gray-800 mb-1 flex items-center gap-2">
                              <span className="material-icons text-blue-500">
                                videocam
                              </span>{" "}
                              {cam.camera_name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              รุ่น: {cam.model_camera || "-"}
                            </p>
                          </div>
                          <span
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                              cam.status === "ออฟไลน์"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {cam.status === "ออนไลน์" ? (
                              <Wifi size={14} />
                            ) : (
                              <WifiOff size={14} />
                            )}
                            {cam.status === "ออฟไลน์" ? "ออฟไลน์" : "ออนไลน์"}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>IP Address:</span>
                            <span className="font-mono">
                              {cam.ip_address || "-"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>IP VPN:</span>
                            <span className="font-mono">
                              {cam.ip_vpn || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">RTSP URL:</span>
                            <p className="font-mono text-xs break-all mt-1">
                              {cam.rtsp_url || "-"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar size={14} />
                            <span>ติดตั้งเมื่อ:</span>
                            <span>{cam.date_install || "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>มุมติดตั้ง:</span>
                            <span>{cam.angle_install || "-"}</span>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-200">
                            <button
                              onClick={() => handleOpenEdit(cam, animal)}
                              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-400 to-sky-700 shadow-md hover:scale-105 hover:brightness-110 transition-all"
                            >
                              <span className="material-icons text-sm">
                                edit
                              </span>{" "}
                              แก้ไข
                            </button>
                            <button
                              onClick={() => handleDeleteCamera(cam.id)}
                              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold shadow flex items-center justify-center gap-2 shadow-md hover:scale-105 hover:brightness-110 transition-all"
                            >
                              <span className="material-icons text-sm">
                                delete
                              </span>{" "}
                              ลบ
                            </button>
                            <button
                              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-400 to-amber-700 shadow-md hover:scale-105 hover:brightness-110 transition-all"
                              onClick={() => {
                                setSelectedCamera(cam); // cam.id ต้องเป็น ID จริงจาก server
                                setShowMovePopup(true);
                              }}
                            >
                              ย้ายกล้อง
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* AddCamera Modal */}
      <AddCamera
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        currentAnimal={currentAnimal}
        editingCamera={editingCamera}
        onSubmit={async (data) => {
          try {
            const apiUrl = editingCamera
              ? `${API_BASE}/UpdateCamera/${editingCamera.id}`
              : `${API_BASE}/Addcamera`;
            const method = "POST";
            const res = await fetch(apiUrl, {
              method,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(data),
            });
            const json = await res.json();

            if (!json.success) {
              alert("❌ บันทึกข้อมูลไม่สำเร็จ");
            } else {
              // ใช้ ID จริงจาก server
              const newCamera = editingCamera
                ? { ...editingCamera, ...data }
                : json.data;

              setAnimals((prev) =>
                prev.map((ani) =>
                  ani.id !== currentAnimal.id
                    ? ani
                    : {
                        ...ani,
                        cameras: editingCamera
                          ? ani.cameras.map((c) =>
                              c.id === editingCamera.id ? { ...c, ...data } : c
                            )
                          : [...(ani.cameras || []), newCamera],
                      }
                )
              );
            }
          } catch (err) {
            alert("❌ เกิดข้อผิดพลาด");
            console.error(err);
          } finally {
            setShowForm(false);
          }
        }}
      />
      {/* Move Camera Popup */}
      {selectedCamera && (
        <MoveCameraPopup
          isOpen={showMovePopup}
          onClose={() => setShowMovePopup(false)}
          camera={selectedCamera}
          onSubmitSuccess={async () => {
            setLoading(true);

            try {
              const res = await fetch(`${API_BASE}/GetcameraAnimal`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const json = await res.json();
              const list = Array.isArray(json.data) ? json.data : [];
              const filteredAnimals = list.filter(
                (a) => String(a.zoo_id) === String(id)
              );
              setAnimals(filteredAnimals);
            } catch (err) {
              console.error("โหลดกล้องหลังย้ายล้มเหลว:", err);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </>
  );
}
