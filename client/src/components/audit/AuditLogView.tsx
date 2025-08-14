import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type AuditLog } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function AuditLogView() {
  const { data: auditLogs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit-logs']
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityTypeDisplay = (entityType: string) => {
    switch (entityType) {
      case 'MEMBER':
        return 'Member';
      case 'MEETING':
        return 'Meeting';
      case 'ROTATION':
        return 'Rotation';
      case 'ANNOUNCEMENT':
        return 'Announcement';
      default:
        return entityType;
    }
  };

  const formatMetadata = (metadata: string | null) => {
    if (!metadata) return '';
    try {
      const parsed = JSON.parse(metadata);
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch {
      return metadata;
    }
  };

  if (isLoading) {
    return (
      <div data-testid="audit-log-view-loading">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-gray-600 mt-1">System activity history</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div data-testid="audit-log-view">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Audit Log</h2>
        <p className="text-gray-600 mt-1">System activity history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {!auditLogs || auditLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500" data-testid="no-audit-logs">
              No activity recorded yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`audit-log-${log.id}`}>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)} data-testid={`audit-action-${log.id}`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`audit-entity-${log.id}`}>
                        {getEntityTypeDisplay(log.entityType)}
                      </TableCell>
                      <TableCell className="font-mono text-sm" data-testid={`audit-entity-id-${log.id}`}>
                        {log.entityId.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`audit-metadata-${log.id}`}>
                        {formatMetadata(log.metadata)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500" data-testid={`audit-time-${log.id}`}>
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
