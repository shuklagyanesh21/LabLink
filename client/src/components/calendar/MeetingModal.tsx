import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMeetingSchema, type Member } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const formSchema = insertMeetingSchema.extend({
  endTime: z.string().min(1, "End time is required"),
});

type FormData = z.infer<typeof formSchema>;

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  meetingId?: string;
}

export default function MeetingModal({ isOpen, onClose, defaultDate, meetingId }: MeetingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ['/api/members']
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      presenterId: "",
      type: "PaperPresentation",
      date: defaultDate || new Date().toISOString().split('T')[0],
      startTime: "14:00",
      endTime: "15:00",
      description: "",
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/meetings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      toast({
        title: "Meeting created",
        description: "The meeting has been scheduled successfully.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create meeting",
        description: error.message || "There was an error creating the meeting.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMeetingMutation.mutate(data);
  };

  const activeMembers = members.filter(member => member.isActive);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="meeting-modal">
        <DialogHeader>
          <DialogTitle>Create Meeting</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="meeting-form">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Meeting title" 
                      {...field} 
                      data-testid="input-meeting-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="presenterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presenter</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-presenter">
                        <SelectValue placeholder="Select presenter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.studentStatus})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-meeting-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PaperPresentation">Paper Presentation</SelectItem>
                      <SelectItem value="WorkPresentation">Work Presentation</SelectItem>
                      <SelectItem value="Tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-meeting-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time (IST)</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        data-testid="input-start-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time (IST)</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field} 
                      data-testid="input-end-time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Meeting description"
                      rows={3}
                      {...field} 
                      data-testid="textarea-meeting-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-meeting"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createMeetingMutation.isPending}
                data-testid="button-create-meeting"
              >
                {createMeetingMutation.isPending ? "Creating..." : "Create Meeting"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
