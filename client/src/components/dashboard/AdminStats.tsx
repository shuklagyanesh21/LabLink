import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Member } from "@shared/schema";
import { isInternExpiringSoon } from "@/utils/dateUtils";

export default function AdminStats() {
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ['/api/members']
  });

  if (isLoading) {
    return (
      <Card data-testid="admin-stats-loading">
        <CardHeader>
          <CardTitle>Lab Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-6" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!members) {
    return (
      <Card data-testid="admin-stats-error">
        <CardHeader>
          <CardTitle>Lab Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Unable to load statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeMembers = members.filter(m => m.isActive);
  const phdStudents = activeMembers.filter(m => m.studentStatus === 'PhD').length;
  const mtechStudents = activeMembers.filter(m => m.studentStatus === 'MTech').length;
  const btechStudents = activeMembers.filter(m => m.studentStatus === 'BTech').length;
  const interns = activeMembers.filter(m => m.studentStatus === 'Intern').length;
  const expiringSoon = activeMembers.filter(m => 
    m.studentStatus === 'Intern' && 
    m.internExpirationDate && 
    isInternExpiringSoon(m.internExpirationDate.toString())
  ).length;

  return (
    <Card data-testid="admin-stats">
      <CardHeader>
        <CardTitle>Lab Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Active Members</span>
          <span className="font-semibold" data-testid="stat-active-members">
            {activeMembers.length}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">PhD Students</span>
          <span className="font-semibold" data-testid="stat-phd-students">
            {phdStudents}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">MTech Students</span>
          <span className="font-semibold" data-testid="stat-mtech-students">
            {mtechStudents}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">BTech Students</span>
          <span className="font-semibold" data-testid="stat-btech-students">
            {btechStudents}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Interns</span>
          <span className="font-semibold" data-testid="stat-interns">
            {interns}
          </span>
        </div>
        {expiringSoon > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center text-amber-600">
              <span className="text-sm">Expiring Soon</span>
              <span className="font-semibold" data-testid="stat-expiring-soon">
                {expiringSoon}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
