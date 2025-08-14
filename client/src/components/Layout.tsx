import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "./dashboard/Dashboard";
import CalendarView from "./calendar/CalendarView";
import MembersView from "./members/MembersView";
import RotationView from "./rotation/RotationView";
import AnnouncementsView from "./announcements/AnnouncementsView";
import AuditLogView from "./audit/AuditLogView";

type View = "dashboard" | "calendar" | "members" | "rotation" | "announcements" | "audit";

export default function Layout() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "calendar":
        return <CalendarView />;
      case "members":
        return <MembersView />;
      case "rotation":
        return <RotationView />;
      case "announcements":
        return <AnnouncementsView />;
      case "audit":
        return <AuditLogView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6 bg-gray-50">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
