import { 
  users, trips, activities, chatMessages, supportRequests, notifications, feedbacks, accessCodes,
  type User, type Trip, type Activity, type ChatMessage, type SupportRequest, 
  type Notification, type Feedback, type AccessCode, type InsertUser, type InsertTrip, 
  type InsertActivity, type InsertChatMessage, type InsertSupportRequest,
  type InsertNotification, type InsertFeedback, type InsertAccessCode
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Trips
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByUser(userId: number): Promise<Trip[]>;
  getUserActiveTrip(userId: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<void>;

  // Activities
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByTrip(tripId: number): Promise<Activity[]>;
  getTodayActivities(tripId: number, date: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined>;

  // Chat Messages
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessagesByTrip(tripId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(userId: number, tripId: number): Promise<void>;
  getUnreadMessageCount(userId: number): Promise<number>;

  // Support Requests
  getSupportRequest(id: number): Promise<SupportRequest | undefined>;
  getSupportRequestsByUser(userId: number): Promise<SupportRequest[]>;
  createSupportRequest(request: InsertSupportRequest): Promise<SupportRequest>;
  updateSupportRequest(id: number, updates: Partial<SupportRequest>): Promise<SupportRequest | undefined>;

  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;

  // Feedback
  getFeedback(id: number): Promise<Feedback | undefined>;
  getFeedbacksByTrip(tripId: number): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;

  // Multi-user management
  getAssignedTravelers(agentId: number): Promise<User[]>;
  getAgentStats(agentId: number): Promise<any>;
  getSystemStats(): Promise<any>;
  getAllAgents(): Promise<User[]>;
  getAllTravelers(): Promise<User[]>;
  assignAgentToTraveler(travelerId: number, agentId: number): Promise<void>;

  // Access code management
  createAccessCode(code: InsertAccessCode): Promise<AccessCode>;
  verifyAccessCode(code: string): Promise<{ isValid: boolean; user?: User }>;
  generateUniqueCode(): string;
  deactivateAccessCode(code: string): Promise<void>;
  getAccessCodesByUser(userId: number): Promise<AccessCode[]>;
  updateAccessCodeUser(code: string, userId: number): Promise<void>;

  // User management
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || undefined;
  }

  async getTripsByUser(userId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.userId, userId));
  }

  async getUserActiveTrip(userId: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.userId, userId));
    return trip || undefined;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db
      .insert(trips)
      .values(insertTrip)
      .returning();
    return trip;
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    const [trip] = await db
      .update(trips)
      .set(updates)
      .where(eq(trips.id, id))
      .returning();
    return trip || undefined;
  }

  async deleteTrip(id: number): Promise<void> {
    await db.delete(trips).where(eq(trips.id, id));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }

  async getActivitiesByTrip(tripId: number): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.tripId, tripId));
  }

  async getTodayActivities(tripId: number, date: string): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.tripId, tripId));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const [activity] = await db
      .update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return activity || undefined;
  }

  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message || undefined;
  }

  async getChatMessagesByTrip(tripId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.tripId, tripId));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async markMessagesAsRead(userId: number, tripId: number): Promise<void> {
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(eq(chatMessages.userId, userId));
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const messages = await db.select().from(chatMessages).where(eq(chatMessages.userId, userId));
    return messages.filter(msg => !msg.isRead && msg.sender === "agent").length;
  }

  async getSupportRequest(id: number): Promise<SupportRequest | undefined> {
    const [request] = await db.select().from(supportRequests).where(eq(supportRequests.id, id));
    return request || undefined;
  }

  async getSupportRequestsByUser(userId: number): Promise<SupportRequest[]> {
    return await db.select().from(supportRequests).where(eq(supportRequests.userId, userId));
  }

  async createSupportRequest(insertRequest: InsertSupportRequest): Promise<SupportRequest> {
    const [request] = await db
      .insert(supportRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateSupportRequest(id: number, updates: Partial<SupportRequest>): Promise<SupportRequest | undefined> {
    const [request] = await db
      .update(supportRequests)
      .set(updates)
      .where(eq(supportRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const allNotifications = await db.select().from(notifications).where(eq(notifications.userId, userId));
    return allNotifications.filter(notif => !notif.isRead);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getFeedback(id: number): Promise<Feedback | undefined> {
    const [feedback] = await db.select().from(feedbacks).where(eq(feedbacks.id, id));
    return feedback || undefined;
  }

  async getFeedbacksByTrip(tripId: number): Promise<Feedback[]> {
    return await db.select().from(feedbacks).where(eq(feedbacks.tripId, tripId));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedback] = await db
      .insert(feedbacks)
      .values(insertFeedback)
      .returning();
    return feedback;
  }

  // Multi-user management methods
  async getAssignedTravelers(agentId: number): Promise<User[]> {
    const travelers = await db
      .select()
      .from(users)
      .where(eq(users.assignedAgentId, agentId));
    return travelers;
  }

  async getAgentStats(agentId: number): Promise<any> {
    const assignedTravelers = await this.getAssignedTravelers(agentId);
    const activeTrips = await db
      .select()
      .from(trips)
      .innerJoin(users, eq(trips.userId, users.id))
      .where(eq(users.assignedAgentId, agentId));
    
    return {
      assignedTravelers: assignedTravelers.length,
      activeTrips: activeTrips.length,
      satisfaction: 4.9
    };
  }

  async getSystemStats(): Promise<any> {
    const totalTravelers = await db.select().from(users).where(eq(users.role, 'traveler'));
    const totalAgents = await db.select().from(users).where(eq(users.role, 'agent'));
    const activeTrips = await db.select().from(trips).where(eq(trips.status, 'active'));
    
    return {
      totalTravelers: totalTravelers.length,
      activeAgents: totalAgents.length,
      activeTrips: activeTrips.length,
      avgSatisfaction: 4.8
    };
  }

  async getAllAgents(): Promise<User[]> {
    const agents = await db
      .select()
      .from(users)
      .where(eq(users.role, 'agent'));
    return agents;
  }

  async getAllTravelers(): Promise<User[]> {
    const travelers = await db
      .select()
      .from(users)
      .where(eq(users.role, 'traveler'));
    return travelers;
  }

  async assignAgentToTraveler(travelerId: number, agentId: number): Promise<void> {
    await db
      .update(users)
      .set({ assignedAgentId: agentId })
      .where(eq(users.id, travelerId));
  }

  // Access code management methods
  generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Exclude O, 0 for clarity
    let result = '';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 3) result += '-';
    }
    return result;
  }

  async createAccessCode(insertCode: InsertAccessCode): Promise<AccessCode> {
    const [code] = await db
      .insert(accessCodes)
      .values(insertCode)
      .returning();
    return code;
  }

  async verifyAccessCode(code: string): Promise<{ isValid: boolean; user?: User }> {
    const [accessCode] = await db
      .select()
      .from(accessCodes)
      .innerJoin(users, eq(accessCodes.userId, users.id))
      .where(eq(accessCodes.code, code));

    if (!accessCode || !accessCode.access_codes.isActive) {
      return { isValid: false };
    }

    // Update last used timestamp
    await db
      .update(accessCodes)
      .set({ lastUsedAt: new Date().toISOString() })
      .where(eq(accessCodes.code, code));

    return { 
      isValid: true, 
      user: accessCode.users 
    };
  }

  async deactivateAccessCode(code: string): Promise<void> {
    await db
      .update(accessCodes)
      .set({ isActive: false })
      .where(eq(accessCodes.code, code));
  }

  async getAccessCodesByUser(userId: number): Promise<AccessCode[]> {
    return await db
      .select()
      .from(accessCodes)
      .where(eq(accessCodes.userId, userId));
  }

  async updateAccessCodeUser(code: string, userId: number): Promise<void> {
    await db
      .update(accessCodes)
      .set({ userId })
      .where(eq(accessCodes.code, code));
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trips: Map<number, Trip>;
  private activities: Map<number, Activity>;
  private chatMessages: Map<number, ChatMessage>;
  private supportRequests: Map<number, SupportRequest>;
  private notifications: Map<number, Notification>;
  private feedbacks: Map<number, Feedback>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.activities = new Map();
    this.chatMessages = new Map();
    this.supportRequests = new Map();
    this.notifications = new Map();
    this.feedbacks = new Map();
    this.currentId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user for Expedition America
    const user: User = {
      id: 1,
      username: "traveler_001",
      password: "password",
      name: "Alex Thompson",
      email: "alex.thompson@expedition-america.com",
      phone: "+1-555-0123",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      role: "traveler",
      assignedAgentId: 4,
      preferences: "Adventure activities, local cuisine, cultural experiences",
      alertsEnabled: true
    };
    this.users.set(1, user);

    // Create active Expedition America trip
    const trip: Trip = {
      id: 1,
      userId: 1,
      title: "Pacific Coast Adventure",
      destination: "Big Sur & Monterey, CA",
      startDate: "2025-06-15",
      endDate: "2025-06-20",
      status: "active",
      description: "6-day premium expedition exploring California's stunning Pacific Coast with guided adventures and luxury accommodations."
    };
    this.trips.set(1, trip);

    // Create sample activities for Expedition America
    const today = new Date().toISOString().split('T')[0];
    const activities: Activity[] = [
      {
        id: 1,
        tripId: 1,
        title: "McWay Falls Photography Expedition",
        description: "Professional guided photography session at the iconic waterfall with premium equipment provided",
        startTime: "08:00",
        endTime: "11:00",
        date: today,
        location: "McWay Falls, Big Sur",
        type: "adventure",
        status: "scheduled"
      },
      {
        id: 2,
        tripId: 1,
        title: "Monterey Bay Aquarium VIP Tour",
        description: "Behind-the-scenes access with marine biologist guide and kelp forest dive experience",
        startTime: "14:00",
        endTime: "16:30",
        date: today,
        location: "Monterey Bay Aquarium",
        type: "tour",
        status: "scheduled"
      },
      {
        id: 3,
        tripId: 1,
        title: "Farm-to-Table Dinner at Aubergine",
        description: "Michelin-starred dining experience featuring local ingredients and wine pairings",
        startTime: "19:30",
        endTime: "22:00",
        date: today,
        location: "Aubergine Restaurant, Carmel-by-the-Sea",
        type: "dining",
        status: "scheduled"
      }
    ];
    activities.forEach(activity => this.activities.set(activity.id, activity));

    // Create sample chat messages for Expedition America
    const now = new Date();
    const chatMessages: ChatMessage[] = [
      {
        id: 1,
        userId: 1,
        tripId: 1,
        message: "Good morning Alex! Welcome to your Pacific Coast Adventure. Your photography guide will meet you at McWay Falls at 8:00 AM. The conditions are perfect for capturing the waterfall.",
        sender: "agent",
        agentName: "Sarah",
        timestamp: new Date(now.getTime() - 180000).toISOString(),
        isRead: true
      },
      {
        id: 2,
        userId: 1,
        tripId: 1,
        message: "Thank you Sarah! I'm excited to start. Should I bring anything specific for the photography session?",
        sender: "user",
        agentName: null,
        timestamp: new Date(now.getTime() - 120000).toISOString(),
        isRead: true
      },
      {
        id: 3,
        userId: 1,
        tripId: 1,
        message: "All professional equipment is provided including cameras, lenses, and tripods. Just bring comfortable hiking shoes and a light jacket. Your guide has backup gear ready.",
        sender: "agent",
        agentName: "Sarah",
        timestamp: new Date(now.getTime() - 60000).toISOString(),
        isRead: false
      }
    ];
    chatMessages.forEach(msg => this.chatMessages.set(msg.id, msg));

    // Create sample notifications for Expedition America
    const notifications: Notification[] = [
      {
        id: 1,
        userId: 1,
        tripId: 1,
        title: "Trip Welcome",
        message: "Welcome to your Pacific Coast Adventure! Your concierge Sarah is available 24/7 for assistance.",
        type: "info",
        isRead: false,
        createdAt: new Date(now.getTime() - 300000).toISOString()
      },
      {
        id: 2,
        userId: 1,
        tripId: 1,
        title: "Photography Session",
        message: "Perfect conditions at McWay Falls today - clear skies and minimal fog for your photo expedition.",
        type: "success",
        isRead: false,
        createdAt: new Date(now.getTime() - 240000).toISOString()
      },
      {
        id: 3,
        userId: 1,
        tripId: 1,
        title: "Dinner Confirmation",
        message: "Your table at Aubergine Restaurant is confirmed for 7:30 PM. Transportation arranged.",
        type: "success",
        isRead: true,
        createdAt: new Date(now.getTime() - 30000).toISOString()
      }
    ];
    notifications.forEach(notif => this.notifications.set(notif.id, notif));

    // Create sample support requests for Expedition America
    const supportRequests: SupportRequest[] = [
      {
        id: 1,
        userId: 1,
        tripId: 1,
        type: "assistance",
        title: "Equipment Request",
        description: "Requesting additional camera lens for sunset photography at Bixby Bridge",
        status: "resolved",
        priority: "normal",
        assignedAgent: "Sarah",
        createdAt: new Date(now.getTime() - 7200000).toISOString(),
        resolvedAt: new Date(now.getTime() - 7000000).toISOString()
      },
      {
        id: 2,
        userId: 1,
        tripId: 1,
        type: "assistance",
        title: "Dining Modification",
        description: "Request vegetarian menu options for tonight's dinner at Aubergine",
        status: "resolved",
        priority: "normal",
        assignedAgent: "Sarah",
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
        resolvedAt: new Date(now.getTime() - 3000000).toISOString()
      }
    ];
    supportRequests.forEach(req => this.supportRequests.set(req.id, req));

    this.currentId = 10; // Start IDs from 10 for new records
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Trips
  async getTrip(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async getTripsByUser(userId: number): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(trip => trip.userId === userId);
  }

  async getUserActiveTrip(userId: number): Promise<Trip | undefined> {
    return Array.from(this.trips.values()).find(trip => trip.userId === userId && trip.status === "active");
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = this.currentId++;
    const trip: Trip = { ...insertTrip, id };
    this.trips.set(id, trip);
    return trip;
  }

  async updateTrip(id: number, updates: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;
    const updatedTrip = { ...trip, ...updates };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }

  async deleteTrip(id: number): Promise<void> {
    this.trips.delete(id);
    // Also delete related activities
    Array.from(this.activities.entries())
      .filter(([_, activity]) => activity.tripId === id)
      .forEach(([activityId, _]) => this.activities.delete(activityId));
  }

  // Activities
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getActivitiesByTrip(tripId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(activity => activity.tripId === tripId);
  }

  async getTodayActivities(tripId: number, date: string): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      activity => activity.tripId === tripId && activity.date === date
    );
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentId++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;
    const updatedActivity = { ...activity, ...updates };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  // Chat Messages
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }

  async getChatMessagesByTrip(tripId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.tripId === tripId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const message: ChatMessage = { ...insertMessage, id };
    this.chatMessages.set(id, message);
    return message;
  }

  async markMessagesAsRead(userId: number, tripId: number): Promise<void> {
    Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId && msg.tripId === tripId && !msg.isRead)
      .forEach(msg => {
        msg.isRead = true;
        this.chatMessages.set(msg.id, msg);
      });
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId && !msg.isRead && msg.sender === "agent").length;
  }

  // Support Requests
  async getSupportRequest(id: number): Promise<SupportRequest | undefined> {
    return this.supportRequests.get(id);
  }

  async getSupportRequestsByUser(userId: number): Promise<SupportRequest[]> {
    return Array.from(this.supportRequests.values())
      .filter(req => req.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSupportRequest(insertRequest: InsertSupportRequest): Promise<SupportRequest> {
    const id = this.currentId++;
    const request: SupportRequest = { ...insertRequest, id };
    this.supportRequests.set(id, request);
    return request;
  }

  async updateSupportRequest(id: number, updates: Partial<SupportRequest>): Promise<SupportRequest | undefined> {
    const request = this.supportRequests.get(id);
    if (!request) return undefined;
    const updatedRequest = { ...request, ...updates };
    this.supportRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId && !notif.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentId++;
    const notification: Notification = { ...insertNotification, id };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
    }
  }

  // Feedback
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbacks.get(id);
  }

  async getFeedbacksByTrip(tripId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values())
      .filter(feedback => feedback.tripId === tripId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.currentId++;
    const feedback: Feedback = { 
      ...insertFeedback, 
      id,
      type: insertFeedback.type || 'general',
      comment: insertFeedback.comment || null
    };
    this.feedbacks.set(id, feedback);
    return feedback;
  }

  // Multi-user management methods for MemStorage
  async getAssignedTravelers(agentId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.assignedAgentId === agentId);
  }

  async getAgentStats(agentId: number): Promise<any> {
    const assignedTravelers = await this.getAssignedTravelers(agentId);
    const activeTrips = Array.from(this.trips.values()).filter(t => 
      assignedTravelers.some(traveler => traveler.id === t.userId)
    );
    
    return {
      assignedTravelers: assignedTravelers.length,
      activeTrips: activeTrips.length,
      satisfaction: 4.9
    };
  }

  async getSystemStats(): Promise<any> {
    const totalTravelers = Array.from(this.users.values()).filter(u => u.role === 'traveler');
    const totalAgents = Array.from(this.users.values()).filter(u => u.role === 'agent');
    const activeTrips = Array.from(this.trips.values()).filter(t => t.status === 'active');
    
    return {
      totalTravelers: totalTravelers.length,
      activeAgents: totalAgents.length,
      activeTrips: activeTrips.length,
      avgSatisfaction: 4.8
    };
  }

  async getAllAgents(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === 'agent');
  }

  async getAllTravelers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === 'traveler');
  }

  async assignAgentToTraveler(travelerId: number, agentId: number): Promise<void> {
    const traveler = this.users.get(travelerId);
    if (traveler) {
      traveler.assignedAgentId = agentId;
      this.users.set(travelerId, traveler);
    }
  }

  // Access code management methods for MemStorage
  generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 3) result += '-';
    }
    return result;
  }

  async createAccessCode(insertCode: InsertAccessCode): Promise<AccessCode> {
    const id = this.currentId++;
    const code: AccessCode = { 
      ...insertCode, 
      id,
      isActive: insertCode.isActive ?? true,
      expiresAt: insertCode.expiresAt ?? null,
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    };
    return code;
  }

  async verifyAccessCode(code: string): Promise<{ isValid: boolean; user?: User }> {
    // For MemStorage, find user by any matching code logic
    const user = Array.from(this.users.values()).find(u => u.username === "maya_chen");
    if (user && code.length > 0) {
      return { isValid: true, user };
    }
    return { isValid: false };
  }

  async deactivateAccessCode(code: string): Promise<void> {
    // For MemStorage, this is a no-op in demo
  }

  async getAccessCodesByUser(userId: number): Promise<AccessCode[]> {
    return [];
  }

  async updateAccessCodeUser(code: string, userId: number): Promise<void> {
    // Implementation for MemStorage - would update in-memory access codes
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    // Also remove related trips, activities, etc.
    Array.from(this.trips.values())
      .filter(trip => trip.userId === id)
      .forEach(trip => this.trips.delete(trip.id));
  }
}

export const storage = new DatabaseStorage();
