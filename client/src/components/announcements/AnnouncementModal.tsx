import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertAnnouncementSchema, type Announcement } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const formSchema = insertAnnouncementSchema.extend({
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement?: Announcement | null;
}

export default function AnnouncementModal({ isOpen, onClose, announcement }: AnnouncementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!announcement;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: announcement?.title || "",
      body: announcement?.body || "",
      expiresAt: announcement?.expiresAt 
        ? new Date(announcement.expiresAt).toISOString().split('T')[0]
        : "",
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };
      return await apiRequest("POST", "/api/announcements", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({
        title: "Announcement created",
        description: "The announcement has been posted successfully.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create announcement",
        description: error.message || "There was an error creating the announcement.",
        variant: "destructive",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!announcement) throw new Error("No announcement to update");
      const payload = {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };
      return await apiRequest("PATCH", `/api/announcements/${announcement.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({
        title: "Announcement updated",
        description: "The announcement has been updated successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update announcement",
        description: error.message || "There was an error updating the announcement.",
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async () => {
      if (!announcement) throw new Error("No announcement to delete");
      return await apiRequest("DELETE", `/api/announcements/${announcement.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      toast({
        title: "Announcement deleted",
        description: "The announcement has been removed successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete announcement",
        description: error.message || "There was an error deleting the announcement.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateAnnouncementMutation.mutate(data);
    } else {
      createAnnouncementMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (announcement && window.confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncementMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="announcement-modal">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Announcement" : "Create Announcement"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="announcement-form">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Announcement title" 
                      {...field} 
                      data-testid="input-announcement-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Announcement content"
                      rows={4}
                      {...field} 
                      data-testid="textarea-announcement-body"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-announcement-expires"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-sm text-gray-500">
                    Leave empty for announcements that don't expire
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              {isEditing && (
                <Button 
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteAnnouncementMutation.isPending}
                  data-testid="button-delete-announcement"
                >
                  {deleteAnnouncementMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel-announcement"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
                  data-testid="button-save-announcement"
                >
                  {(createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending) 
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
