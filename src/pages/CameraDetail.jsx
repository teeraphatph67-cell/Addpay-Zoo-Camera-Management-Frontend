import { useEffect, useState } from "react";
import { Wifi, WifiOff, Calendar, Video } from "lucide-react";
import { API_IMG, API_BASE } from "../config/api";

export default function CameraDetail({ animal, onClose }) {
  const [animalData, setAnimalData] = useState(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchAnimalCameras = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/GetAnimalCameraStream?animal_id=${animal.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (data.success && data.data.length > 0) {
          const currentAnimal = data.data.find((a) => a.id === animal.id);
          setAnimalData(currentAnimal || { ...animal, cameras: [] });
        } else {
          setAnimalData({ ...animal, cameras: [] });
        }
      } catch (err) {
        console.error("fetchAnimalCameras error:", err);
        setAnimalData({ ...animal, cameras: [] });
      }
    };

    fetchAnimalCameras();
  }, [animal]);

  if (!animalData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header ค้างบน */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-700 p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="material-icons text-yellow-300 text-3xl">
              pets
            </span>
            กล้องของ: {animalData.animal || animalData.animal_name}
          </h2>
          <button
            className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* เนื้อหากล้อง เลื่อนข้างใต้ header */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {animalData.cameras?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {animalData.cameras.map((cam) => (
                <div
                  key={cam.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header ของแต่ละกล้อง */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h5 className="font-bold text-gray-800 text-xl mb-1">
                        {cam.camera_name}
                      </h5>
                      <p className="text-sm text-gray-500">
                        รุ่น: {cam.model_camera || "-"}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-semibold shadow-sm ${
                        cam.status === "ออนไลน์"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-red-100 text-red-700 border border-red-300"
                      }`}
                    >
                      {cam.status === "ออนไลน์" ? (
                        <Wifi size={14} />
                      ) : (
                        <WifiOff size={14} />
                      )}
                      {cam.status === "ออนไลน์" ? "ออนไลน์" : "ออฟไลน์"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center">
                      <span className="font-medium w-32 text-gray-600">
                        IP Address:
                      </span>
                      <span className="font-mono">{cam.ip_address || "-"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-32 text-gray-600">
                        IP VPN:
                      </span>
                      <span className="font-mono">{cam.ip_vpn || "-"}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-32 text-gray-600">
                        RTSP URL:
                      </span>
                      <span className="font-mono text-xs break-all">
                        {cam.rtsp_url || "-"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 text-blue-500" />
                      <span className="font-medium mr-2 text-gray-600">
                        ติดตั้งเมื่อ:
                      </span>
                      <span>{cam.date_install || "-"}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium w-32 text-gray-600">
                        มุมติดตั้ง:
                      </span>
                      <span>{cam.angle_install || "-"}</span>
                    </div>
                  </div>

                  {/* View Stream */}
                  <button
                    className="mt-6 w-full py-3 bg-gradient-to-r from-sky-400 to-purple-700 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"
                    onClick={() => {
                      if (cam.streams?.[0]?.stream_url) {
                        window.open(cam.streams[0].stream_url, "_blank");
                      } else {
                        alert("ยังไม่มีสตรีมสำหรับกล้องนี้");
                      }
                    }}
                  >
                    <Video size={20} /> ดูสตรีม (เปิดหน้าต่างใหม่)
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">ไม่พบข้อมูลกล้อง</p>
          )}
        </div>
      </div>
    </div>  
  );
}
