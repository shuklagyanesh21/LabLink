import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertMeetingSchema, insertAnnouncementSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Members routes
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const memberData = insertMemberSchema.parse(req.body);
      
      // Check for email uniqueness
      const existingMember = await storage.getMemberByEmail(memberData.email);
      if (existingMember) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const member = await storage.createMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  app.patch("/api/members/:id", async (req, res) => {
    try {
      const updateData = insertMemberSchema.partial().parse(req.body);
      const member = await storage.updateMember(req.params.id, updateData);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update member" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      const success = await storage.deleteMember(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Member not found" });
      }
      res.json({ message: "Member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete member" });
    }
  });

  // Meetings routes
  app.get("/api/meetings", async (req, res) => {
    try {
      const meetings = await storage.getMeetings();
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      
      // Check for presenter conflicts
      const existingMeetings = await storage.getMeetings();
      const conflict = existingMeetings.find(meeting => 
        meeting.presenterId === meetingData.presenterId &&
        meeting.date === meetingData.date &&
        ((meetingData.startTime >= meeting.startTime && meetingData.startTime < meeting.endTime) ||
         (meetingData.endTime > meeting.startTime && meetingData.endTime <= meeting.endTime) ||
         (meetingData.startTime <= meeting.startTime && meetingData.endTime >= meeting.endTime))
      );

      if (conflict) {
        return res.status(400).json({ message: "Presenter has conflicting meeting at this time" });
      }

      const meeting = await storage.createMeeting(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.patch("/api/meetings/:id", async (req, res) => {
    try {
      const updateData = insertMeetingSchema.partial().parse(req.body);
      
      // Check for conflicts if updating presenter, date, or time
      if (updateData.presenterId || updateData.date || updateData.startTime || updateData.endTime) {
        const currentMeeting = await storage.getMeeting(req.params.id);
        if (!currentMeeting) {
          return res.status(404).json({ message: "Meeting not found" });
        }

        const updatedMeeting = { ...currentMeeting, ...updateData };
        const existingMeetings = await storage.getMeetings();
        const conflict = existingMeetings.find(meeting => 
          meeting.id !== req.params.id &&
          meeting.presenterId === updatedMeeting.presenterId &&
          meeting.date === updatedMeeting.date &&
          ((updatedMeeting.startTime >= meeting.startTime && updatedMeeting.startTime < meeting.endTime) ||
           (updatedMeeting.endTime > meeting.startTime && updatedMeeting.endTime <= meeting.endTime) ||
           (updatedMeeting.startTime <= meeting.startTime && updatedMeeting.endTime >= meeting.endTime))
        );

        if (conflict) {
          return res.status(400).json({ message: "Presenter has conflicting meeting at this time" });
        }
      }

      const meeting = await storage.updateMeeting(req.params.id, updateData);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      const success = await storage.deleteMeeting(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Rotation routes
  app.get("/api/rotation", async (req, res) => {
    try {
      const rotation = await storage.getRotation();
      res.json(rotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rotation" });
    }
  });

  app.post("/api/rotation/reorder", async (req, res) => {
    try {
      const { rotationIds } = req.body;
      if (!Array.isArray(rotationIds)) {
        return res.status(400).json({ message: "rotationIds must be an array" });
      }

      // Update order indices based on new array order
      for (let i = 0; i < rotationIds.length; i++) {
        await storage.updateRotation(rotationIds[i], { orderIndex: i + 1 });
      }

      const updatedRotation = await storage.getRotation();
      res.json(updatedRotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder rotation" });
    }
  });

  app.patch("/api/rotation/:id/present", async (req, res) => {
    try {
      const rotation = await storage.updateRotation(req.params.id, {
        lastPresentedAt: new Date()
      });
      if (!rotation) {
        return res.status(404).json({ message: "Rotation entry not found" });
      }
      res.json(rotation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rotation" });
    }
  });

  // Announcements routes
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await storage.getAnnouncements();
      // Filter out expired announcements
      const now = new Date();
      const activeAnnouncements = announcements.filter(announcement => 
        !announcement.expiresAt || new Date(announcement.expiresAt) > now
      );
      res.json(activeAnnouncements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post("/api/announcements", async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid announcement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch("/api/announcements/:id", async (req, res) => {
    try {
      const updateData = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(req.params.id, updateData);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid announcement data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/announcements/:id", async (req, res) => {
    try {
      const success = await storage.deleteAnnouncement(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Audit log routes
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const auditLogs = await storage.getAuditLogs();
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Data management routes
  app.get("/api/export", async (req, res) => {
    try {
      const data = await storage.exportData();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=lab-data.json');
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.post("/api/import", async (req, res) => {
    try {
      await storage.importData(req.body);
      res.json({ message: "Data imported successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to import data" });
    }
  });

  app.post("/api/seed", async (req, res) => {
    try {
      await storage.loadSeedData();
      res.json({ message: "Seed data loaded successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to load seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
