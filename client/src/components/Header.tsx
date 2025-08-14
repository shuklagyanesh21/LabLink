import { Microscope, Settings } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { useIST } from "@/hooks/useIST";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { adminMode, toggleAdminMode } = useAppContext();
  const currentTime = useIST();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Lab Branding */}
          <div className="flex items-center space-x-3" data-testid="lab-branding">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Microscope className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900" data-testid="lab-name">
                SharmaG_omics Lab
              </h1>
              <div className="text-xs text-gray-500">Lab Management System</div>
            </div>
          </div>

          {/* IST Clock & Admin Toggle */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600" data-testid="ist-clock">
              <span className="mr-1">🕐</span>
              <span>{currentTime}</span>
            </div>
            
            <Button
              onClick={toggleAdminMode}
              variant={adminMode ? "default" : "outline"}
              size="sm"
              className="transition-colors"
              data-testid="button-admin-toggle"
            >
              <Settings className="mr-1.5 h-4 w-4" />
              {adminMode ? 'Exit Admin' : 'Admin Mode'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
