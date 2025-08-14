import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertMemberSchema, type Member } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const formSchema = insertMemberSchema.extend({
  internExpirationDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
}

export default function MemberModal({ isOpen, onClose, member }: MemberModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!member;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name || "",
      email: member?.email || "",
      role: member?.role || "NonAdmin",
      studentStatus: member?.studentStatus || "BTech",
      isActive: member?.isActive ?? true,
      internExpirationDate: member?.internExpirationDate 
        ? new Date(member.internExpirationDate).toISOString().split('T')[0]
        : "",
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        internExpirationDate: data.internExpirationDate ? new Date(data.internExpirationDate) : null,
      };
      return await apiRequest("POST", "/api/members", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rotation'] });
      toast({
        title: "Member created",
        description: "The member has been added successfully.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create member",
        description: error.message || "There was an error creating the member.",
        variant: "destructive",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!member) throw new Error("No member to update");
      const payload = {
        ...data,
        internExpirationDate: data.internExpirationDate ? new Date(data.internExpirationDate) : null,
      };
      return await apiRequest("PATCH", `/api/members/${member.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rotation'] });
      toast({
        title: "Member updated",
        description: "The member has been updated successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update member",
        description: error.message || "There was an error updating the member.",
        variant: "destructive",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async () => {
      if (!member) throw new Error("No member to delete");
      return await apiRequest("DELETE", `/api/members/${member.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rotation'] });
      toast({
        title: "Member deleted",
        description: "The member has been removed successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete member",
        description: error.message || "There was an error deleting the member.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMemberMutation.mutate(data);
    } else {
      createMemberMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (member && window.confirm("Are you sure you want to delete this member?")) {
      deleteMemberMutation.mutate();
    }
  };

  const studentStatus = form.watch("studentStatus");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="member-modal">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Member" : "Add Member"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="member-form">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Full name" 
                      {...field} 
                      data-testid="input-member-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="email@example.com" 
                      {...field} 
                      data-testid="input-member-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-member-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="NonAdmin">Non-Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-student-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="MTech">MTech</SelectItem>
                        <SelectItem value="BTech">BTech</SelectItem>
                        <SelectItem value="Intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {studentStatus === "Intern" && (
              <FormField
                control={form.control}
                name="internExpirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internship Expiration Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-expiration-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Member</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Whether this member is currently active in the lab
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-member-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              {isEditing && (
                <Button 
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMemberMutation.isPending}
                  data-testid="button-delete-member"
                >
                  {deleteMemberMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel-member"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMemberMutation.isPending || updateMemberMutation.isPending}
                  data-testid="button-save-member"
                >
                  {(createMemberMutation.isPending || updateMemberMutation.isPending) 
                    ? "Saving..." 
                    : isEditing ? "Update" : "Create"
                  }
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
