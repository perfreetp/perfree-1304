import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import StorageConfig from "@/pages/StorageConfig";
import LockerManager from "@/pages/LockerManager";
import CheckIn from "@/pages/CheckIn";
import CheckOut from "@/pages/CheckOut";
import Incident from "@/pages/Incident";
import Scheduling from "@/pages/Scheduling";
import Settlement from "@/pages/Settlement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/storage-config" element={<StorageConfig />} />
          <Route path="/locker-manager" element={<LockerManager />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/check-out" element={<CheckOut />} />
          <Route path="/incident" element={<Incident />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/settlement" element={<Settlement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
