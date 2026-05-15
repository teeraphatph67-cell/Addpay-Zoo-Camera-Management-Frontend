import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout/MainLayout.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Login from "./pages/Login.jsx";
import Edit from "./pages/Editanimal.jsx";
import AddCamera from "./pages/AddCamera.jsx";
import ZooDetail from "./pages/ZooDetail.jsx";
import CameraDetail from "./pages/CameraDetail.jsx";
import EditCamera from "./pages/EditCamera.jsx";
import Managecamera from "./pages/Managecamera.jsx";
import StreamForm from "./pages/StreamForm.jsx";
import StreamDashboard from "./pages/StreamDashboard.jsx";
import EditStreamForm from "./pages/EditStreamForm.jsx";
import StreamLive from "./pages/StreamLive.jsx";
import NotificationPopup from "./pages/NotificationPopup.jsx";
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Hero />} />
        <Route path="edit" element={<Edit />} />
        <Route path="AddCamera" element={<AddCamera />} />
        <Route path="zoo/:id" element={<ZooDetail />} />
        <Route path="zoo/:zooId/camera" element={<CameraDetail />} />
        <Route path="edit-camera/:id" element={<EditCamera />} />
        <Route path="Managecamera/:id" element={<Managecamera />} />
        <Route path="StreamForm/:zooId" element={<StreamForm />} />
        <Route path="StreamDashboard/:zooId" element={<StreamDashboard />} />
        <Route path="EditStreamForm/:id" element={<EditStreamForm />} />
      </Route>


      {/* ------------------- */}
      {/* หน้าเต็มจอ ไม่มี Navbar */}
      {/* ------------------- */}
      <Route path="/StreamLive" element={<StreamLive />} />
      <Route path="/StreamLive/:zooId" element={<StreamLive />} />
      <Route path="/StreamLive/:zooId" element={<StreamLive />} />
    </Routes>
  );
}

export default App;
