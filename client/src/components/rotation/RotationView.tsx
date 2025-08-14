import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, CheckCircle, Plus } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Rotation, type Member } from "@shared/schema";

export default function RotationView() {
  const { adminMode } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rotation, isLoading: rotationLoading } = useQuery<Rotation[]>({
    queryKey: ['/api/rotation']
  });

  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ['/api/members']
  });

  const markPresentedMutation = useMutation({
    mutationFn: async (rotationId: string) => {
      return await apiRequest("PATCH", `/api/rotation/${rotationId}/present`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rotation'] });
      toast({
        title: "Presentation marked",
        description: "Member's presentation has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to mark presentation",
        description: error.message || "There was an error recording the presentation.",
        variant: "destructive",
      });
    },
  });

  const reorderRotationMutation = useMutation({
    mutationFn: async (rotationIds: string[]) => {
      return await apiRequest("POST", "/api/rotation/reorder", { rotationIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rotation'] });
      toast({
        title: "Rotation reordered",
        description: "The presentation order has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reorder rotation",
        description: error.message || "There was an error updating the order.",
        variant: "destructive",
      });
    },
  });

  const isLoading = rotationLoading || membersLoading;

  if (isLoading) {
    return (
      <div data-testid="rotation-view-loading">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Presentation Rotation</h2>
          <p className="text-gray-600 mt-1">Manage presentation order and schedule</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Rotation Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Up</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!rotation || !members) {
    return (
      <div data-testid="rotation-view-error">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Presentation Rotation</h2>
          <p className="text-gray-600 mt-1">Manage presentation order and schedule</p>
        </div>
        
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              No rotation data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const membersMap = new Map(members.map(m => [m.id, m]));
  const activeMembers = members.filter(m => m.isActive);
  const sortedRotation = rotation
    .filter(r => r.active && membersMap.has(r.memberId))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const nextPresenter = sortedRotation.length > 0 ? sortedRotation[0] : null;

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...sortedRotation];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    const rotationIds = newOrder.map(r => r.id);
    reorderRotationMutation.mutate(rotationIds);
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedRotation.length - 1) return;
    const newOrder = [...sortedRotation];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    const rotationIds = newOrder.map(r => r.id);
    reorderRotationMutation.mutate(rotationIds);
  };

  const handleMarkPresented = (rotationId: string) => {
    markPresentedMutation.mutate(rotationId);
  };

  const getStudentStatusDisplay = (status: string) => {
    switch (status) {
      case 'PhD': return 'PhD Student';
      case 'MTech': return 'MTech Student';
      case 'BTech': return 'BTech Student';
      case 'Intern': return 'Intern';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PhD': return 'bg-blue-100 text-blue-800';
      case 'MTech': return 'bg-green-100 text-green-800';
      case 'BTech': return 'bg-purple-100 text-purple-800';
      case 'Intern': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div data-testid="rotation-view">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Presentation Rotation</h2>
        <p className="text-gray-600 mt-1">Manage presentation order and schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Rotation Order */}
        <Card>
          <CardHeader>
            <CardTitle>Current Rotation Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedRotation.length === 0 ? (
              <div className="text-center py-8 text-gray-500" data-testid="no-rotation-members">
                No members in rotation
              </div>
            ) : (
              sortedRotation.map((rotationItem, index) => {
                const member = membersMap.get(rotationItem.memberId);
                if (!member) return null;

                return (
                  <div 
                    key={rotationItem.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                    data-testid={`rotation-item-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-gray-400">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900" data-testid={`rotation-member-name-${index}`}>
                          {member.name}
                        </div>
                        <Badge className={getStatusBadgeColor(member.studentStatus)} data-testid={`rotation-member-status-${index}`}>
                          {getStudentStatusDisplay(member.studentStatus)}
                        </Badge>
                        {rotationItem.lastPresentedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Last presented: {new Date(rotationItem.lastPresentedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {adminMode && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || reorderRotationMutation.isPending}
                          data-testid={`button-move-up-${index}`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === sortedRotation.length - 1 || reorderRotationMutation.isPending}
                          data-testid={`button-move-down-${index}`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkPresented(rotationItem.id)}
                          disabled={markPresentedMutation.isPending}
                          className="text-green-600 hover:text-green-700"
                          data-testid={`button-mark-presented-${index}`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Next Up & Stats */}
        <div className="space-y-6">
          {/* Next Up */}
          <Card>
            <CardHeader>
              <CardTitle>Next Up</CardTitle>
            </CardHeader>
            <CardContent>
              {nextPresenter ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg" data-testid="next-up-presenter">
                  <div className="font-semibold text-lg text-gray-900" data-testid="next-up-name">
                    {membersMap.get(nextPresenter.memberId)?.name}
                  </div>
                  <Badge className={getStatusBadgeColor(membersMap.get(nextPresenter.memberId)?.studentStatus || '')} data-testid="next-up-status">
                    {getStudentStatusDisplay(membersMap.get(nextPresenter.memberId)?.studentStatus || '')}
                  </Badge>
                  {nextPresenter.lastPresentedAt && (
                    <div className="text-sm text-gray-600 mt-2">
                      Last presented: {new Date(nextPresenter.lastPresentedAt).toLocaleDateString()}
                    </div>
                  )}
                  {adminMode && (
                    <Button
                      onClick={() => handleMarkPresented(nextPresenter.id)}
                      disabled={markPresentedMutation.isPending}
                      className="mt-3 bg-green-600 hover:bg-green-700"
                      size="sm"
                      data-testid="button-mark-next-presented"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Presented
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500" data-testid="no-next-presenter">
                  No one is scheduled to present
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rotation Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Rotation Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total in Rotation</span>
                <span className="font-semibold" data-testid="stat-total-rotation">
                  {sortedRotation.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Members</span>
                <span className="font-semibold" data-testid="stat-active-members">
                  {activeMembers.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Presented This Cycle</span>
                <span className="font-semibold" data-testid="stat-presented">
                  {sortedRotation.filter(r => r.lastPresentedAt).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
