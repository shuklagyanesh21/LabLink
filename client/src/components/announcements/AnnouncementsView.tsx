import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import AnnouncementModal from "./AnnouncementModal";
import { type Announcement } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function AnnouncementsView() {
  const { adminMode } = useAppContext();
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements']
  });

  const handleEditAnnouncement = (announcement: Announcement) => {
    if (adminMode) {
      setEditingAnnouncement(announcement);
      setShowAnnouncementModal(true);
    }
  };

  const handleAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setShowAnnouncementModal(true);
  };

  if (isLoading) {
    return (
      <div data-testid="announcements-view-loading">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Announcements</h2>
            <p className="text-gray-600 mt-1">Lab announcements and notices</p>
          </div>
          {adminMode && <Skeleton className="h-10 w-40" />}
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const now = new Date();
  const activeAnnouncements = announcements?.filter(announcement => 
    !announcement.expiresAt || new Date(announcement.expiresAt) > now
  ) || [];

  const expiredAnnouncements = announcements?.filter(announcement => 
    announcement.expiresAt && new Date(announcement.expiresAt) <= now
  ) || [];

  return (
    <div data-testid="announcements-view">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Announcements</h2>
          <p className="text-gray-600 mt-1">Lab announcements and notices</p>
        </div>
        
        {adminMode && (
          <Button
            onClick={handleAddAnnouncement}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-add-announcement"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Announcement
          </Button>
        )}
      </div>

      {/* Active Announcements */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-900">Active Announcements</h3>
        {activeAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500" data-testid="no-active-announcements">
                No active announcements
              </div>
            </CardContent>
          </Card>
        ) : (
          activeAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow" data-testid={`announcement-${announcement.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900" data-testid={`announcement-title-${announcement.id}`}>
                    {announcement.title}
                  </h4>
                  {adminMode && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAnnouncement(announcement)}
                        data-testid={`button-edit-announcement-${announcement.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4" data-testid={`announcement-body-${announcement.id}`}>
                  {announcement.body}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500" data-testid={`announcement-date-${announcement.id}`}>
                    Posted {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" data-testid={`announcement-status-${announcement.id}`}>
                      Active
                    </Badge>
                    {announcement.expiresAt && (
                      <span className="text-gray-500" data-testid={`announcement-expires-${announcement.id}`}>
                        Expires {formatDistanceToNow(new Date(announcement.expiresAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Expired Announcements (Admin Only) */}
      {adminMode && expiredAnnouncements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Expired Announcements</h3>
          {expiredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="opacity-60" data-testid={`expired-announcement-${announcement.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900" data-testid={`expired-announcement-title-${announcement.id}`}>
                    {announcement.title}
                  </h4>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAnnouncement(announcement)}
                      data-testid={`button-edit-expired-announcement-${announcement.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4" data-testid={`expired-announcement-body-${announcement.id}`}>
                  {announcement.body}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500" data-testid={`expired-announcement-date-${announcement.id}`}>
                    Posted {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" data-testid={`expired-announcement-status-${announcement.id}`}>
                      Expired
                    </Badge>
                    {announcement.expiresAt && (
                      <span className="text-gray-500" data-testid={`expired-announcement-expired-${announcement.id}`}>
                        Expired {formatDistanceToNow(new Date(announcement.expiresAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <AnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={() => {
            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
          }}
          announcement={editingAnnouncement}
        />
      )}
    </div>
  );
}
