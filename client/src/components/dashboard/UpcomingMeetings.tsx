import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Meeting, type Member } from "@shared/schema";
import { getUpcomingMeetings, formatDisplayDate, formatDisplayTime, getMeetingTypeBadgeClass } from "@/utils/dateUtils";

export default function UpcomingMeetings() {
  const { data: meetings, isLoading: meetingsLoading } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings']
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ['/api/members']
  });

  const isLoading = meetingsLoading || membersLoading;

  if (isLoading) {
    return (
      <Card data-testid="upcoming-meetings-loading">
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
          <p className="text-sm text-gray-500">Next 2 weeks</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Skeleton className="w-3 h-3 rounded-full mr-4" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const upcomingMeetings = meetings ? getUpcomingMeetings(meetings) : [];
  const membersMap = members ? new Map(members.map(m => [m.id, m])) : new Map();

  const getMeetingTypeDisplay = (type: string) => {
    switch (type) {
      case 'PaperPresentation':
        return 'Paper Presentation';
      case 'WorkPresentation':
        return 'Work Presentation';
      case 'Tutorial':
        return 'Tutorial';
      default:
        return type;
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'PaperPresentation':
        return 'bg-yellow-500';
      case 'WorkPresentation':
        return 'bg-purple-500';
      case 'Tutorial':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card data-testid="upcoming-meetings">
      <CardHeader>
        <CardTitle>Upcoming Meetings</CardTitle>
        <p className="text-sm text-gray-500">Next 2 weeks</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingMeetings.length === 0 ? (
          <div className="text-center py-8 text-gray-500" data-testid="no-upcoming-meetings">
            No upcoming meetings scheduled
          </div>
        ) : (
          upcomingMeetings.map((meeting) => {
            const presenter = membersMap.get(meeting.presenterId);
            return (
              <div 
                key={meeting.id} 
                className="flex items-center p-4 bg-gray-50 rounded-lg"
                data-testid={`meeting-${meeting.id}`}
              >
                <div className={`w-3 h-3 rounded-full mr-4 ${getMeetingTypeColor(meeting.type)}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900" data-testid={`meeting-title-${meeting.id}`}>
                    {meeting.title}
                  </h4>
                  <div className="text-sm text-gray-600" data-testid={`meeting-details-${meeting.id}`}>
                    <span>{presenter?.name || 'Unknown Presenter'}</span> • 
                    <span> {formatDisplayDate(meeting.date)}</span> • 
                    <span> {formatDisplayTime(meeting.startTime)} - {formatDisplayTime(meeting.endTime)} IST</span>
                  </div>
                  <Badge 
                    className={`mt-1 ${getMeetingTypeBadgeClass(meeting.type)}`}
                    data-testid={`meeting-type-${meeting.id}`}
                  >
                    {getMeetingTypeDisplay(meeting.type)}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
