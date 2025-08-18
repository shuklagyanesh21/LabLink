import { 
  type Member, type InsertMember,
  type Meeting, type InsertMeeting,
  type Rotation, type InsertRotation,
  type Announcement, type InsertAnnouncement,
  type AuditLog, type InsertAuditLog
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  // Members
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  getMemberByEmail(email: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: string): Promise<boolean>;

  // Meetings
  getMeetings(): Promise<Meeting[]>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, meeting: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: string): Promise<boolean>;

  // Rotation
  getRotation(): Promise<Rotation[]>;
  createRotation(rotation: InsertRotation): Promise<Rotation>;
  updateRotation(id: string, rotation: Partial<InsertRotation>): Promise<Rotation | undefined>;
  deleteRotation(id: string): Promise<boolean>;

  // Announcements
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;

  // Audit Logs
  getAuditLogs(): Promise<AuditLog[]>;
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;

  // Data management
  exportData(): Promise<any>;
  importData(data: any): Promise<void>;
  loadSeedData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private members: Map<string, Member>;
  private meetings: Map<string, Meeting>;
  private rotation: Map<string, Rotation>;
  private announcements: Map<string, Announcement>;
  private auditLogs: Map<string, AuditLog>;
  private dataFile: string;

  constructor() {
    this.members = new Map();
    this.meetings = new Map();
    this.rotation = new Map();
    this.announcements = new Map();
    this.auditLogs = new Map();
    this.dataFile = path.join(process.cwd(), 'lab-data.json');
    this.loadFromFile();
  }

  private async loadFromFile() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf-8');
      const parsed = JSON.parse(data);
      
      if (parsed.members) {
        this.members = new Map(parsed.members);
      }
      if (parsed.meetings) {
        this.meetings = new Map(parsed.meetings);
      }
      if (parsed.rotation) {
        this.rotation = new Map(parsed.rotation);
      }
      if (parsed.announcements) {
        this.announcements = new Map(parsed.announcements);
      }
      if (parsed.auditLogs) {
        this.auditLogs = new Map(parsed.auditLogs);
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty data
      await this.loadSeedData();
    }
  }

  private async saveToFile() {
    try {
      const data = {
        members: Array.from(this.members.entries()),
        meetings: Array.from(this.meetings.entries()),
        rotation: Array.from(this.rotation.entries()),
        announcements: Array.from(this.announcements.entries()),
        auditLogs: Array.from(this.auditLogs.entries())
      };
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save data to file:', error);
    }
  }

  private filterDeleted<T extends { deletedAt?: Date | null }>(items: T[]): T[] {
    return items.filter(item => !item.deletedAt);
  }

  // Members
  async getMembers(): Promise<Member[]> {
    const members = Array.from(this.members.values());
    return this.filterDeleted(members);
  }

  async getMember(id: string): Promise<Member | undefined> {
    const member = this.members.get(id);
    return member && !member.deletedAt ? member : undefined;
  }

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const members = await this.getMembers();
    return members.find(member => member.email === email);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = randomUUID();
    const now = new Date();
    const member: Member = {
      ...insertMember,
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };
    this.members.set(id, member);
    
    // Auto-add new member to presentation rotation
    await this.addMemberToRotation(id);
    
    await this.saveToFile();
    await this.createAuditLog({
      action: "CREATE",
      entityType: "MEMBER",
      entityId: id,
      metadata: JSON.stringify({ name: member.name })
    });
    return member;
  }

  async updateMember(id: string, updateData: Partial<InsertMember>): Promise<Member | undefined> {
    const member = this.members.get(id);
    if (!member || member.deletedAt) return undefined;

    const updatedMember: Member = {
      ...member,
      ...updateData,
      updatedAt: new Date()
    };
    this.members.set(id, updatedMember);
    await this.saveToFile();
    await this.createAuditLog({
      action: "UPDATE",
      entityType: "MEMBER",
      entityId: id,
      metadata: JSON.stringify(updateData)
    });
    return updatedMember;
  }

  async deleteMember(id: string): Promise<boolean> {
    const member = this.members.get(id);
    if (!member || member.deletedAt) return false;

    const deletedMember: Member = {
      ...member,
      deletedAt: new Date()
    };
    this.members.set(id, deletedMember);
    
    // Remove member from rotation when deleted
    await this.removeMemberFromRotation(id);
    
    await this.saveToFile();
    await this.createAuditLog({
      action: "DELETE",
      entityType: "MEMBER",
      entityId: id,
      metadata: JSON.stringify({ name: member.name })
    });
    return true;
  }

  // Meetings
  async getMeetings(): Promise<Meeting[]> {
    const meetings = Array.from(this.meetings.values());
    return this.filterDeleted(meetings);
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    return meeting && !meeting.deletedAt ? meeting : undefined;
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = randomUUID();
    const now = new Date();
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };
    this.meetings.set(id, meeting);
    await this.saveToFile();
    await this.createAuditLog({
      action: "CREATE",
      entityType: "MEETING",
      entityId: id,
      metadata: JSON.stringify({ title: meeting.title })
    });
    return meeting;
  }

  async updateMeeting(id: string, updateData: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting || meeting.deletedAt) return undefined;

    const updatedMeeting: Meeting = {
      ...meeting,
      ...updateData,
      updatedAt: new Date()
    };
    this.meetings.set(id, updatedMeeting);
    await this.saveToFile();
    await this.createAuditLog({
      action: "UPDATE",
      entityType: "MEETING",
      entityId: id,
      metadata: JSON.stringify(updateData)
    });
    return updatedMeeting;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    const meeting = this.meetings.get(id);
    if (!meeting || meeting.deletedAt) return false;

    const deletedMeeting: Meeting = {
      ...meeting,
      deletedAt: new Date()
    };
    this.meetings.set(id, deletedMeeting);
    await this.saveToFile();
    await this.createAuditLog({
      action: "DELETE",
      entityType: "MEETING",
      entityId: id,
      metadata: JSON.stringify({ title: meeting.title })
    });
    return true;
  }

  // Rotation
  async getRotation(): Promise<Rotation[]> {
    return Array.from(this.rotation.values());
  }

  async createRotation(insertRotation: InsertRotation): Promise<Rotation> {
    const id = randomUUID();
    const rotation: Rotation = {
      ...insertRotation,
      id
    };
    this.rotation.set(id, rotation);
    await this.saveToFile();
    await this.createAuditLog({
      action: "CREATE",
      entityType: "ROTATION",
      entityId: id,
      metadata: JSON.stringify({ memberId: rotation.memberId })
    });
    return rotation;
  }

  async updateRotation(id: string, updateData: Partial<InsertRotation>): Promise<Rotation | undefined> {
    const rotation = this.rotation.get(id);
    if (!rotation) return undefined;

    const updatedRotation: Rotation = {
      ...rotation,
      ...updateData
    };
    this.rotation.set(id, updatedRotation);
    await this.saveToFile();
    await this.createAuditLog({
      action: "UPDATE",
      entityType: "ROTATION",
      entityId: id,
      metadata: JSON.stringify(updateData)
    });
    return updatedRotation;
  }

  async deleteRotation(id: string): Promise<boolean> {
    const deleted = this.rotation.delete(id);
    if (deleted) {
      await this.saveToFile();
      await this.createAuditLog({
        action: "DELETE",
        entityType: "ROTATION",
        entityId: id
      });
    }
    return deleted;
  }

  // Helper method to add new member to rotation automatically
  private async addMemberToRotation(memberId: string): Promise<void> {
    try {
      // Get current rotation entries to determine the next order index
      const currentRotation = await this.getRotation();
      
      // Check if member is already in rotation to avoid duplicates
      const existingEntry = currentRotation.find(r => r.memberId === memberId);
      if (existingEntry) {
        console.log('Member already in rotation, skipping');
        return;
      }
      
      const maxOrderIndex = currentRotation.length > 0 
        ? Math.max(...currentRotation.map(r => r.orderIndex))
        : -1;
      
      // Add the new member to the end of the rotation
      const rotationEntry: Rotation = {
        id: randomUUID(),
        memberId,
        orderIndex: maxOrderIndex + 1,
        active: true,
        lastPresentedAt: null
      };
      
      this.rotation.set(rotationEntry.id, rotationEntry);
      
      await this.createAuditLog({
        action: "CREATE",
        entityType: "ROTATION",
        entityId: rotationEntry.id,
        metadata: JSON.stringify({ memberId, autoAdded: true })
      });
    } catch (error) {
      console.error('Error in addMemberToRotation:', error);
      // Don't throw - allow member creation to succeed even if rotation fails
    }
  }

  // Helper method to remove member from rotation when deleted
  private async removeMemberFromRotation(memberId: string): Promise<void> {
    const rotationEntries = await this.getRotation();
    const memberRotationEntry = rotationEntries.find(r => r.memberId === memberId);
    
    if (memberRotationEntry) {
      // Remove the member's rotation entry
      this.rotation.delete(memberRotationEntry.id);
      
      // Reorder remaining entries to fill the gap
      const remainingEntries = rotationEntries
        .filter(r => r.memberId !== memberId)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      
      // Update order indices to be sequential
      remainingEntries.forEach((entry, index) => {
        const updatedEntry = { ...entry, orderIndex: index };
        this.rotation.set(entry.id, updatedEntry);
      });
      
      await this.createAuditLog({
        action: "DELETE",
        entityType: "ROTATION",
        entityId: memberRotationEntry.id,
        metadata: JSON.stringify({ memberId, autoRemoved: true })
      });
    }
  }

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const announcements = Array.from(this.announcements.values());
    return this.filterDeleted(announcements);
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    return announcement && !announcement.deletedAt ? announcement : undefined;
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = randomUUID();
    const now = new Date();
    const announcement: Announcement = {
      ...insertAnnouncement,
      id,
      createdAt: now,
      deletedAt: null
    };
    this.announcements.set(id, announcement);
    await this.saveToFile();
    await this.createAuditLog({
      action: "CREATE",
      entityType: "ANNOUNCEMENT",
      entityId: id,
      metadata: JSON.stringify({ title: announcement.title })
    });
    return announcement;
  }

  async updateAnnouncement(id: string, updateData: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (!announcement || announcement.deletedAt) return undefined;

    const updatedAnnouncement: Announcement = {
      ...announcement,
      ...updateData
    };
    this.announcements.set(id, updatedAnnouncement);
    await this.saveToFile();
    await this.createAuditLog({
      action: "UPDATE",
      entityType: "ANNOUNCEMENT",
      entityId: id,
      metadata: JSON.stringify(updateData)
    });
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const announcement = this.announcements.get(id);
    if (!announcement || announcement.deletedAt) return false;

    const deletedAnnouncement: Announcement = {
      ...announcement,
      deletedAt: new Date()
    };
    this.announcements.set(id, deletedAnnouncement);
    await this.saveToFile();
    await this.createAuditLog({
      action: "DELETE",
      entityType: "ANNOUNCEMENT",
      entityId: id,
      metadata: JSON.stringify({ title: announcement.title })
    });
    return true;
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const auditLog: AuditLog = {
      ...insertAuditLog,
      id,
      timestamp: new Date()
    };
    this.auditLogs.set(id, auditLog);
    // Don't save to file here to avoid infinite recursion
    return auditLog;
  }

  // Data management
  async exportData(): Promise<any> {
    return {
      members: Array.from(this.members.values()),
      meetings: Array.from(this.meetings.values()),
      rotation: Array.from(this.rotation.values()),
      announcements: Array.from(this.announcements.values()),
      auditLogs: Array.from(this.auditLogs.values())
    };
  }

  async importData(data: any): Promise<void> {
    if (data.members) {
      this.members = new Map(data.members.map((m: Member) => [m.id, m]));
    }
    if (data.meetings) {
      this.meetings = new Map(data.meetings.map((m: Meeting) => [m.id, m]));
    }
    if (data.rotation) {
      this.rotation = new Map(data.rotation.map((r: Rotation) => [r.id, r]));
    }
    if (data.announcements) {
      this.announcements = new Map(data.announcements.map((a: Announcement) => [a.id, a]));
    }
    if (data.auditLogs) {
      this.auditLogs = new Map(data.auditLogs.map((l: AuditLog) => [l.id, l]));
    }
    await this.saveToFile();
  }

  async loadSeedData(): Promise<void> {
    // Create sample members
    const adminMember = await this.createMember({
      name: "Dr. Sharma G",
      email: "sharma.g@lab.edu",
      role: "Admin",
      studentStatus: "PhD",
      isActive: true
    });

    const member1 = await this.createMember({
      name: "Priya Patel",
      email: "priya.patel@lab.edu",
      role: "NonAdmin",
      studentStatus: "PhD",
      isActive: true
    });

    const member2 = await this.createMember({
      name: "Amit Kumar",
      email: "amit.kumar@lab.edu",
      role: "NonAdmin",
      studentStatus: "MTech",
      isActive: true
    });

    const member3 = await this.createMember({
      name: "Sarah Chen",
      email: "sarah.chen@lab.edu",
      role: "NonAdmin",
      studentStatus: "BTech",
      isActive: true
    });

    const member4 = await this.createMember({
      name: "Vikram Singh",
      email: "vikram.singh@lab.edu",
      role: "NonAdmin",
      studentStatus: "Intern",
      isActive: true,
      internExpirationDate: new Date('2024-12-31')
    });

    // Create rotation
    await this.createRotation({
      memberId: member3.id,
      orderIndex: 1,
      active: true
    });

    await this.createRotation({
      memberId: member4.id,
      orderIndex: 2,
      active: true
    });

    await this.createRotation({
      memberId: member1.id,
      orderIndex: 3,
      active: true
    });

    // Create sample meetings
    await this.createMeeting({
      title: "Machine Learning in Genomics",
      presenterId: member1.id,
      type: "PaperPresentation",
      date: "2024-12-15",
      startTime: "14:00",
      endTime: "15:00",
      description: "Review of recent ML applications in genomic analysis"
    });

    await this.createMeeting({
      title: "CRISPR Progress Update",
      presenterId: member1.id,
      type: "WorkPresentation",
      date: "2024-12-17",
      startTime: "10:30",
      endTime: "11:30",
      description: "Current progress on CRISPR research project"
    });

    await this.createMeeting({
      title: "RNA-seq Analysis Tutorial",
      presenterId: member2.id,
      type: "Tutorial",
      date: "2024-12-20",
      startTime: "15:00",
      endTime: "16:00",
      description: "Step-by-step guide to RNA-seq data analysis"
    });

    // Create sample announcements
    await this.createAnnouncement({
      title: "Lab Meeting Schedule Change",
      body: "Weekly lab meetings will be moved to Fridays starting next week.",
      expiresAt: new Date('2024-12-31')
    });

    await this.createAnnouncement({
      title: "Equipment Maintenance",
      body: "The PCR machine will be under maintenance from Dec 18-20.",
      expiresAt: new Date('2024-12-21')
    });
  }
}

export const storage = new MemStorage();
