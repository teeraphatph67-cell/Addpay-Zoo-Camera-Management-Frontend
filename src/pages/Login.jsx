import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Sparkles } from "lucide-react";
import { API_BASE } from "../config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const res = await fetch(API_BASE + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data);

    // ✅ เช็ค HTTP status ก่อน
    if (!res.ok) {
      throw new Error(data?.message || "Login failed");
    }

    // ✅ เช็ค token + username
    if (!data.token || !data.username?.id) {
      throw new Error("ข้อมูลจาก API ไม่ถูกต้อง");
    }

    const user = data.username;

    const userSession = {
      id: user.id,
      username: user.username,
      email: user.email,
      zoo_id: user.zoo_id,
      role: user.role,
    };

    // ✅ เก็บข้อมูลให้ครบ
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userSession));

    console.log("TOKEN SAVED:", localStorage.getItem("token"));
    console.log("USER SAVED:", localStorage.getItem("user"));

    setIsSuccess(true);
    setMessage("✅ เข้าสู่ระบบสำเร็จ!");
    setShowPopup(true);

    // ✅ ใช้ replace กันย้อนกลับหน้า login
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 1500);

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    setIsSuccess(false);
    setMessage("❌ " + err.message);
    setShowPopup(true);
  }
};

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-400 to-blue-500 bg-fixed relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-white/5 blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-white/10 blur-xl"></div>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 backdrop-blur-sm bg-white/95">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          ReactProjectZoo
        </h1>
        <p className="text-center text-gray-500 mb-8">จัดการกล้องสวนสัตว์</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 mb-6 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />

        <button
          onClick={handleLogin}
          className="w-full py-4 mb-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform relative overflow-hidden group"
        >
          <span className="relative z-10">เข้าสู่ระบบ</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>

      {/* Animated Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          ></div>
          
          {/* Popup Container */}
          <div className={`relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-500 ${
            showPopup ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}>
            
            {/* Success Animation */}
            {isSuccess && (
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  {/* Main Icon */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* Sparkles */}
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-ping" />
                  <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-yellow-400 animate-pulse" />
                  <Sparkles className="absolute top-4 -right-4 w-4 h-4 text-yellow-300 animate-ping" style={{animationDelay: '0.5s'}} />
                  
                  {/* Pulse Rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-green-400/20 animate-ping" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            )}
            
            {/* Error Animation */}
            {!isSuccess && (
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  {/* Main Icon */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* Shake Effect */}
                  <div className="absolute inset-0 rounded-full border-4 border-red-400/30 animate-ping"></div>
                </div>
              </div>
            )}
            
            {/* Popup Content */}
            <div className="pt-16 text-center">
              <h3 className={`text-2xl font-bold mb-4 ${
                isSuccess ? 'text-green-600' : 'text-red-600'
              }`}>
                {isSuccess ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
              </h3>
              
              <p className="text-gray-600 mb-6 text-lg">
                {message.replace(/[❌✅]/g, '')}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-2500 ${
                    isSuccess ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: showPopup ? '100%' : '0%',
                    transition: 'width 2.5s linear'
                  }}
                ></div>
              </div>
              
              {/* Action Button */}
              <button
                onClick={() => setShowPopup(false)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  isSuccess 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isSuccess ? 'ดำเนินการต่อ...' : 'ลองอีกครั้ง'}
              </button>
            </div>
            
            {/* Decorative Elements */}
            {isSuccess && (
              <>
                <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-green-400/20"></div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-blue-400/20"></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}