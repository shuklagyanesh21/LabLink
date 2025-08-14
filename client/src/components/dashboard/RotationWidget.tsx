import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Rotation, type Member } from "@shared/schema";

export default function RotationWidget() {
  const { data: rotation, isLoading: rotationLoading } = useQuery<Rotation[]>({
    queryKey: ['/api/rotation']
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ['/api/members']
  });

  const isLoading = rotationLoading || membersLoading;

  if (isLoading) {
    return (
      <Card data-testid="rotation-widget-loading">
        <CardHeader>
          <CardTitle>Presentation Rotation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Up Next</h4>
            <div className="p-3 bg-green-50 rounded-lg">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Queue</h4>
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                  <Skeleton className="h-3 w-3" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rotation || !members) {
    return (
      <Card data-testid="rotation-widget-error">
        <CardHeader>
          <CardTitle>Presentation Rotation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No rotation data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const membersMap = new Map(members.map(m => [m.id, m]));
  
  // Sort rotation by order index and filter active members
  const activeRotation = rotation
    .filter(r => r.active && membersMap.has(r.memberId))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Find next presenter (first in rotation who hasn't presented recently or first if all have presented)
  const nextPresenter = activeRotation.length > 0 ? activeRotation[0] : null;
  const queueMembers = activeRotation.slice(1);

  const getStudentStatusDisplay = (status: string) => {
    switch (status) {
      case 'PhD':
        return 'PhD Student';
      case 'MTech':
        return 'MTech Student';
      case 'BTech':
        return 'BTech Student';
      case 'Intern':
        return 'Intern';
      default:
        return status;
    }
  };

  return (
    <Card data-testid="rotation-widget">
      <CardHeader>
        <CardTitle>Presentation Rotation</CardTitle>
      </CardHeader>
      <CardContent>
        {nextPresenter ? (
          <>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Up Next</h4>
              <div className="p-3 bg-green-50 rounded-lg" data-testid="next-presenter">
                <div className="font-medium text-gray-900" data-testid="next-presenter-name">
                  {membersMap.get(nextPresenter.memberId)?.name}
                </div>
                <div className="text-sm text-gray-600" data-testid="next-presenter-status">
                  {getStudentStatusDisplay(membersMap.get(nextPresenter.memberId)?.studentStatus || '')}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Queue</h4>
              <div className="space-y-2">
                {queueMembers.length === 0 ? (
                  <div className="text-sm text-gray-500" data-testid="empty-queue">
                    No other members in queue
                  </div>
                ) : (
                  queueMembers.map((rotationItem, index) => {
                    const member = membersMap.get(rotationItem.memberId);
                    return (
                      <div key={rotationItem.id} className="flex items-center justify-between" data-testid={`queue-member-${index}`}>
                        <div>
                          <div className="text-sm font-medium" data-testid={`queue-member-name-${index}`}>
                            {member?.name}
                          </div>
                          <div className="text-xs text-gray-500" data-testid={`queue-member-status-${index}`}>
                            {getStudentStatusDisplay(member?.studentStatus || '')}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400" data-testid={`queue-position-${index}`}>
                          {index + 2}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500" data-testid="no-rotation">
            No active rotation members
          </div>
        )}
      </CardContent>
    </Card>
  );
}
