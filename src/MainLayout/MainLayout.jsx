import { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const LOGOUT_AFTER = 30 * 60 * 1000; // 30 นาที
  const [timeLeft, setTimeLeft] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const intervalRef = useRef(null);

  // ตรวจสอบ login / token
useEffect(() => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  if (!storedUser || !storedToken) {
    navigate("/login", { replace: true });
    return;
  }

  if (!localStorage.getItem("logoutTime")) {
    localStorage.setItem(
      "logoutTime",
      (Date.now() + LOGOUT_AFTER).toString()
    );
  }

  const updateTime = () => {
    const logoutTime = parseInt(localStorage.getItem("logoutTime") || "0");
    const remaining = Math.max(
      Math.floor((logoutTime - Date.now()) / 1000),
      0
    );

    setTimeLeft(remaining);

    if (remaining <= 0) {
      clearInterval(intervalRef.current);
      localStorage.clear();
      alert("Session ของคุณหมดอายุ กรุณา login ใหม่");
      navigate("/login", { replace: true });
    }
  };

  updateTime();
  intervalRef.current = setInterval(updateTime, 1000);

  const resetTimer = () => {
    const newLogoutTime = Date.now() + LOGOUT_AFTER;
    localStorage.setItem("logoutTime", newLogoutTime.toString());
  };

  const events = ["click", "keydown", "scroll", "mousemove"];
  events.forEach((e) => window.addEventListener(e, resetTimer));

  return () => {
    clearInterval(intervalRef.current);
    events.forEach((e) => window.removeEventListener(e, resetTimer));
  };
}, [navigate]);

  // logout function
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(
          "https://addpaycrypto.com/coop-interns/service/zoo2/public/api/v1/logout",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("ออกจากระบบไม่สำเร็จ — โปรดลองอีกครั้ง");
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  // back function
  const handleBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 relative">
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
        {menuOpen && (
          <div className="flex flex-col gap-2 mb-2">
            <button
              onClick={handleBack}
              className="bg-white text-gray-700 px-4 py-2 rounded-xl shadow-md hover:bg-gray-100 transition"
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 text-white text-2xl shadow-xl flex items-center justify-center hover:from-amber-500 hover:to-amber-600 transition-all"
        >
          ☰
        </button>
      </div>

      <main className="pt-4 px-6 pb-10 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
