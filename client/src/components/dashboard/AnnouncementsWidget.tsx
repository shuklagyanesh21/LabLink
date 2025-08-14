import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { type Announcement } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function AnnouncementsWidget() {
  const { adminMode } = useAppContext();
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements']
  });

  if (isLoading) {
    return (
      <Card data-testid="announcements-widget-loading">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Announcements</CardTitle>
          {adminMode && (
            <Skeleton className="h-8 w-16" />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-2 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const activeAnnouncements = announcements || [];

  return (
    <Card data-testid="announcements-widget">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Announcements</CardTitle>
        {adminMode && (
          <Button
            size="sm"
            variant="ghost"
            className="text-blue-600 hover:text-blue-700"
            data-testid="button-add-announcement"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAnnouncements.length === 0 ? (
          <div className="text-center py-4 text-gray-500" data-testid="no-announcements">
            No active announcements
          </div>
        ) : (
          activeAnnouncements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              data-testid={`announcement-${announcement.id}`}
            >
              <h4 className="font-medium text-gray-900" data-testid={`announcement-title-${announcement.id}`}>
                {announcement.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1" data-testid={`announcement-body-${announcement.id}`}>
                {announcement.body}
              </p>
              <div className="text-xs text-gray-500 mt-2" data-testid={`announcement-date-${announcement.id}`}>
                Posted {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
