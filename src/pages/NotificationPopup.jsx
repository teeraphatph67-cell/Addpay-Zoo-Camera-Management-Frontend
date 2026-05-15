import React, { useEffect } from "react";

const NotificationPopup = ({ type = "success", message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "✅",
          title: "สำเร็จ!",
          gradient: "from-emerald-400 to-green-500",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-800"
        };
      case "error":
        return {
          icon: "❌",
          title: "ข้อผิดพลาด!",
          gradient: "from-rose-400 to-red-500",
          bgColor: "bg-rose-50",
          borderColor: "border-rose-200",
          textColor: "text-rose-800"
        };
      case "warning":
        return {
          icon: "⚠️",
          title: "คำเตือน!",
          gradient: "from-amber-400 to-orange-500",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-800"
        };
      default:
        return {
          icon: "✅",
          title: "สำเร็จ!",
          gradient: "from-emerald-400 to-green-500",
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          textColor: "text-emerald-800"
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Popup Content */}
      <div className={`relative ${config.bgColor} border-2 ${config.borderColor} rounded-2xl shadow-2xl p-8 max-w-sm w-full transform animate-popup-scale`}>
        <div className="text-center">
          {/* Animated Icon */}
          <div className={`w-20 h-20 bg-gradient-to-r ${config.gradient} rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 text-white animate-checkmark`}>
            {config.icon}
          </div>
          
          <h3 className={`text-2xl font-bold ${config.textColor} mb-3`}>
            {config.title}
          </h3>
          
          <p className="text-gray-700 text-lg leading-relaxed">
            {message}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-6">
            <div className={`w-2 h-2 rounded-full ${config.textColor} animate-pulse`}></div>
            <div className={`w-2 h-2 rounded-full ${config.textColor} animate-pulse`} style={{animationDelay: '0.2s'}}></div>
            <div className={`w-2 h-2 rounded-full ${config.textColor} animate-pulse`} style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-800 hover:scale-110 transition-all duration-300 border border-gray-200"
        >
          <span className="material-icons text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;