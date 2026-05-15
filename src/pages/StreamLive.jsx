// StreamLive.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_IMG, API_BASE } from "../config/api";

const ERROR_BG = "https://trip.pref.kanagawa.jp/img/spots/photos/hero/5131702f92b638dee47c8c48649a7950-1920x1080.jpg";

const token = localStorage.getItem("token");
const Check_Camera = "http://10.0.0.4:9997/v3/paths/list";

export default function StreamLive() {
  const { zooId } = useParams();
  const [streams, setStreams] = useState([]);
  const [animalMap, setAnimalMap] = useState({});
  const [current, setCurrent] = useState(null);
  const [todayList, setTodayList] = useState([]);
  const [cameraReadyMap, setCameraReadyMap] = useState({});
  const [cameraApiError, setCameraApiError] = useState(false);

  const convertToEmbedURL = (url) => {
    if (!url) return "";
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
      }
      if (url.includes("/embed/")) {
        return url.includes("?")
          ? `${url}&autoplay=1&mute=1`
          : `${url}?autoplay=1&mute=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const extractCamPath = (url) => {
    if (!url) return null;

    const segments = url.split("/").filter(Boolean); 
    if (segments.length === 0) return null;

    let path = segments[segments.length - 1];

    path = path.split("?")[0];        
    path = path.replace(/\..*$/, ""); 

    return path.trim() || null;
  };

  useEffect(() => {
    const fetchCameraStatus = async () => {
      try {
        console.log("📡 เรียกเช็คสถานะกล้องใหม่แล้ว", new Date().toLocaleTimeString());
        const res = await fetch(Check_Camera, { method: "GET" });
        const data = await res.json();
        const map = {};
        (data.items || []).forEach((item) => {
          map[item.name] = item.ready; // เช่น cam: true/false
        });

        setCameraReadyMap(map);
        setCameraApiError(false);
      } catch (err) {
        console.error("โหลดสถานะกล้องผิดพลาด:", err);
        setCameraApiError(true);
      }
    };

    fetchCameraStatus();
    const id = setInterval(fetchCameraStatus, 5000);
    return () => clearInterval(id);
  }, []);

  // โหลดข้อมูล stream + animal
  useEffect(() => {
    const load = async () => {
      try {
        const headers = { Authorization: "Bearer " + token };

        const [streamRes, animalRes] = await Promise.all([
          fetch(`${API_BASE}/GetStream`, { headers }),
          fetch(`${API_BASE}/GetAnimal`, { headers }),
        ]);

        const [streamJson, animalJson] = await Promise.all([
          streamRes.json(),
          animalRes.json(),
        ]);

        let streamList = streamJson.data || streamJson || [];
        const animalList = animalJson.data || animalJson || [];

        if (zooId) {
          streamList = streamList.filter(
            (s) => Number(s.zoo_id) === Number(zooId)
          );
        }

        const aMap = {};
        animalList.forEach((a) => {
          aMap[a.id] = {
            name: a.animal,
            img: a.img ? `${API_IMG}/${a.img}` : null,
          };
        });
        setAnimalMap(aMap);
        setStreams(streamList);

        const now = new Date();
        const jsDay = now.getDay();
        const appDay = jsDay === 0 ? 7 : jsDay;

        const todayStreams = streamList.filter((s) => {
          const w = Number(s.weekend);
          return w === 0 || w === appDay;
        });

        todayStreams.sort((a, b) => {
          const tA = (a.time_start || "").slice(0, 5);
          const tB = (b.time_start || "").slice(0, 5);
          return tA.localeCompare(tB);
        });

        setTodayList(todayStreams);
        const liveNow = findLiveNow(todayStreams);
        setCurrent(liveNow);
      } catch (err) {
        console.error("โหลดข้อมูล StreamLive ผิดพลาด:", err);
      }
    };

    load();
  }, [zooId]);

  const findLiveNow = (list) => {
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();
    return (
      list.find((s) => {
        if (!s.time_start || !s.time_end) return false;
        const [sh, sm] = s.time_start.slice(0, 5).split(":").map(Number);
        const [eh, em] = s.time_end.slice(0, 5).split(":").map(Number);
        if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return false;
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        return curMinutes >= start && curMinutes <= end && end > start;
      }) || null
    );
  };

  const isNowInRange = (s) => {
    if (!s) return false;
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = s.time_start.slice(0, 5).split(":").map(Number);
    const [eh, em] = s.time_end.slice(0, 5).split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return curMinutes >= start && curMinutes <= end && end > start;
  };

  const formatTime = (t) => t?.slice(0, 5) || "-";
  const currentAnimal = current ? animalMap[current.animal_id] : null;
  const backPath = zooId ? `/StreamDashboard/${zooId}` : "/StreamDashboard";

  // หา currentCamName จาก stream_url เฉพาะกรณีที่เป็นกล้องจาก 10.0.0.4
  let currentCamName = null;
  if (current?.stream_url && current.stream_url.includes("10.0.0.4")) {
    currentCamName = extractCamPath(current.stream_url);
  }

  const currentCamReady =
    currentCamName && currentCamName in cameraReadyMap
      ? cameraReadyMap[currentCamName]
      : true;

  const renderErrorScreen = (message) => (
    <div className="w-full h-full relative">
      {/* พื้นหลังเป็นรูป */}
      <img
        src={ERROR_BG}
        alt="camera error background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* เลเยอร์ทับให้มืดลงหน่อย */}
      <div className="absolute inset-0 bg-black/60" />

      {/* ข้อความแสดง error */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-red-300 text-lg text-center px-4">
        <div className="font-semibold mb-2">{message}</div>
        <div className="text-sm text-gray-200">
          กรุณาตรวจสอบระบบกล้อง หรือทดลองรีเฟรชหน้าอีกครั้ง
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      <Link
        to={backPath}
        className="absolute top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-lg hover:bg-black/70 text-sm"
      >
        ← กลับไป Dashboard
      </Link>

      {current && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-black/60 px-4 py-2 rounded-lg text-lg font-semibold text-white">
          {currentAnimal?.name || `สตรีม ID: ${current.id}`}
        </div>
      )}

      <div className="absolute top-4 right-4 z-40 text-right text-xs md:text-sm">
        <div className="font-semibold text-white mb-1">
          ตารางถ่ายทอดสดวันนี้
        </div>
        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3 space-y-2 shadow-lg text-gray-100">
          {todayList.length === 0 ? (
            <div className="text-gray-300">วันนี้ยังไม่มีตารางสตรีม</div>
          ) : (
            todayList.map((s) => {
              const aInfo = animalMap[s.animal_id];
              const live = isNowInRange(s);
              return (
                <div key={s.id} className="flex items-center gap-2 justify-end">
                  {live && (
                    <span className="inline-flex items-center text-[10px] text-green-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-1" />
                      LIVE
                    </span>
                  )}
                  <span className="text-gray-200">
                    {aInfo?.name || `Animal ID: ${s.animal_id}`}
                  </span>
                  <span className="text-gray-400">
                    {formatTime(s.time_start)} - {formatTime(s.time_end)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="w-full h-full">
        {cameraApiError ? (
          renderErrorScreen("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์กล้องได้")
        ) : current ? (
          currentCamReady === false ? (
            renderErrorScreen(
              currentCamName
                ? `สัญญาณขัดข้อง กล้อง: ${currentCamName}`
                : "สัญญาณขัดข้อง"
            )
          ) : (
            <iframe
              src={convertToEmbedURL(current.stream_url)}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">
            ขณะนี้ยังไม่มีการถ่ายทอดสดในเวลา ณ ตอนนี้
          </div>
        )}
      </div>
    </div>
  );
}
