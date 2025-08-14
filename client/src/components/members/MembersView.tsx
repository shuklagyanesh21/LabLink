import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import MemberModal from "./MemberModal";
import { type Member } from "@shared/schema";

export default function MembersView() {
  const { adminMode } = useAppContext();
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ['/api/members']
  });

  const handleEditMember = (member: Member) => {
    if (adminMode) {
      setEditingMember(member);
      setShowMemberModal(true);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setShowMemberModal(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PhD':
        return 'bg-blue-100 text-blue-800';
      case 'MTech':
        return 'bg-green-100 text-green-800';
      case 'BTech':
        return 'bg-purple-100 text-purple-800';
      case 'Intern':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'Admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div data-testid="members-view-loading">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Members</h2>
            <p className="text-gray-600 mt-1">Lab member management</p>
          </div>
          {adminMode && <Skeleton className="h-10 w-32" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="members-view">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-600 mt-1">Lab member management</p>
        </div>
        
        {adminMode && (
          <Button
            onClick={handleAddMember}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-add-member"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {!members || members.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500" data-testid="no-members">
              No members found
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow" data-testid={`member-card-${member.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900" data-testid={`member-name-${member.id}`}>
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600" data-testid={`member-email-${member.id}`}>
                      {member.email}
                    </p>
                  </div>
                  {adminMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMember(member)}
                      data-testid={`button-edit-member-${member.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getStatusBadgeColor(member.studentStatus)} data-testid={`member-status-${member.id}`}>
                    {member.studentStatus}
                  </Badge>
                  <Badge className={getRoleBadgeColor(member.role)} data-testid={`member-role-${member.id}`}>
                    {member.role}
                  </Badge>
                  {!member.isActive && (
                    <Badge variant="destructive" data-testid={`member-inactive-${member.id}`}>
                      Inactive
                    </Badge>
                  )}
                </div>

                {member.studentStatus === 'Intern' && member.internExpirationDate && (
                  <div className="text-sm text-gray-500" data-testid={`member-expiry-${member.id}`}>
                    Expires: {new Date(member.internExpirationDate).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <MemberModal
          isOpen={showMemberModal}
          onClose={() => {
            setShowMemberModal(false);
            setEditingMember(null);
          }}
          member={editingMember}
        />
      )}
    </div>
  );
}
