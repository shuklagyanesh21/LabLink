import UpcomingMeetings from "./UpcomingMeetings";
import RotationWidget from "./RotationWidget";
import AnnouncementsWidget from "./AnnouncementsWidget";
import AdminStats from "./AdminStats";
import { useAppContext } from "@/contexts/AppContext";

export default function Dashboard() {
  const { adminMode } = useAppContext();

  return (
    <div data-testid="dashboard-view">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Lab overview and upcoming activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2">
          <UpcomingMeetings />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RotationWidget />
          <AnnouncementsWidget />
          {adminMode && <AdminStats />}
        </div>
      </div>
    </div>
  );
}
