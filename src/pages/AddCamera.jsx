// src/pages/AddCamera.jsx
import React, { useState, useEffect } from "react";

export default function AddCamera({
  isOpen,
  onClose,
  currentAnimal,
  editingCamera,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    camera_name: "",
    model_camera: "",
    ip_address: "",
    rtsp_url: "",
    angle_install: "",
    date_install: "",
    status: "ออนไลน์",
    ip_vpn: "",
  });

  const inputClass =
    "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm";

  useEffect(() => {
    if (editingCamera) {
      setFormData({
        camera_name: editingCamera.camera_name || "",
        model_camera: editingCamera.model_camera || "",
        ip_address: editingCamera.ip_address || "",
        rtsp_url: editingCamera.rtsp_url || "",
        angle_install: editingCamera.angle_install || "",
        date_install: editingCamera.date_install || "",
        status: editingCamera.status || "ออนไลน์",
        ip_vpn: editingCamera.ip_vpn || "",
      });
    } else {
      setFormData({
        camera_name: "",
        model_camera: "",
        ip_address: "",
        rtsp_url: "",
        angle_install: "",
        date_install: "",
        status: "ออนไลน์",
        ip_vpn: "",
      });
    }
  }, [editingCamera]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentAnimal) return;
    onSubmit({
      ...formData,
      animal_id: currentAnimal.id,
      zoo_id: currentAnimal.zoo_id,
    });
  };

  if (!isOpen || !currentAnimal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-700 p-6 text-white">
          <h2 className="text-2xl font-bold">
            {editingCamera ? "แก้ไขกล้อง" : "เพิ่มกล้องใหม่"}
          </h2>
          <p className="text-blue-100 mt-1">
            กรอกข้อมูลให้ครบถ้วนและถูกต้อง
          </p>
        </div>

        {/* Form */}
        <form
          className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4"
          onSubmit={handleSubmit}
        >
          {/* ชื่อกล้อง */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อกล้อง
            </label>
            <input
              type="text"
              name="camera_name"
              placeholder="เช่น Hik-camera001"
              className={inputClass}
              value={formData.camera_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* IP Address & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IP Address
              </label>
              <input
                type="text"
                name="ip_address"
                placeholder="192.168.1.100"
                className={inputClass}
                value={formData.ip_address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                name="model_camera"
                placeholder="HRT-8899"
                className={inputClass}
                value={formData.model_camera}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* RTSP URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RTSP URL
            </label>
            <input
              type="text"
              name="rtsp_url"
              placeholder="rtsp://admin:12345@192.168.1.100:554/..."
              className={inputClass}
              value={formData.rtsp_url}
              onChange={handleChange}
            />
          </div>

          {/* IP VPN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP VPN (ถ้ามี)
            </label>
            <input
              type="text"
              name="ip_vpn"
              placeholder="192.168.1.100"
              className={inputClass}
              value={formData.ip_vpn}
              onChange={handleChange}
            />
          </div>

          {/* มุมติดตั้ง */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              มุมติดตั้ง
            </label>
            <input
              type="text"
              name="angle_install"
              placeholder="มุมสูง เหนือสัตว์"
              className={inputClass}
              value={formData.angle_install}
              onChange={handleChange}
            />
          </div>

          {/* วันที่ติดตั้ง */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่ติดตั้ง
            </label>
            <input
              type="date"
              name="date_install"
              className={inputClass}
              value={formData.date_install}
              onChange={handleChange}
            />
          </div>

          {/* สถานะ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะ
            </label>
            <select
              name="status"
              className={inputClass}
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ออนไลน์">ออนไลน์</option>
              <option value="ออฟไลน์">ออฟไลน์</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6 border-t border-gray-200 pt-6">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
