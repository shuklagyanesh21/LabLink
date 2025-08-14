import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  RotateCcw, 
  Megaphone, 
  History,
  Plus,
  UserPlus,
  Download
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { exportData, loadSeedData } from "@/utils/seedData";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { adminMode } = useAppContext();
  const { toast } = useToast();

  const handleExportData = async () => {
    const success = await exportData();
    if (success) {
      toast({
        title: "Data exported successfully",
        description: "Your lab data has been downloaded as a JSON file.",
      });
    } else {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const handleLoadSeedData = async () => {
    const success = await loadSeedData();
    if (success) {
      toast({
        title: "Seed data loaded",
        description: "Sample data has been loaded successfully.",
      });
      // Refresh the page to show new data
      window.location.reload();
    } else {
      toast({
        title: "Failed to load seed data",
        description: "There was an error loading the sample data.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "members", label: "Members", icon: Users },
    { id: "rotation", label: "Rotation", icon: RotateCcw },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "audit", label: "Audit Log", icon: History },
  ];

  return (
    <nav className="bg-white w-64 shadow-sm h-[calc(100vh-4rem)] overflow-y-auto" data-testid="sidebar">
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-600 bg-opacity-10 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Admin Actions */}
        {adminMode && (
          <div className="mt-8 p-3 bg-gray-50 rounded-lg" data-testid="admin-actions">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => onViewChange("calendar")}
                data-testid="button-add-meeting"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Meeting
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => onViewChange("members")}
                data-testid="button-add-member"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={handleExportData}
                data-testid="button-export-data"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={handleLoadSeedData}
                data-testid="button-seed-data"
              >
                <Plus className="mr-2 h-4 w-4" />
                Load Sample Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
