import { 
  users, trips, activities, chatMessages, supportRequests, notifications, feedbacks,
  type User, type Trip, type Activity, type ChatMessage, type SupportRequest, 
  type Notification, type Feedback, type InsertUser, type InsertTrip, 
  type InsertActivity, type InsertChatMessage, type InsertSupportRequest,
  type InsertNotification, type InsertFeedback
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
    // Create sample user
    const user: User = {
      id: 1,
      username: "maya_chen",
      password: "password",
      name: "Maya Chen",
      email: "maya.chen@email.com",
      phone: "+1-555-0123",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face"
    };
    this.users.set(1, user);

    // Create sample trip
    const trip: Trip = {
      id: 1,
      userId: 1,
      title: "San Francisco City Explorer",
      destination: "San Francisco, CA",
      startDate: "2024-03-15",
      endDate: "2024-03-18",
      status: "active",
      description: "4-day comprehensive exploration of San Francisco including major landmarks, local cuisine, and cultural experiences."
    };
    this.trips.set(1, trip);

    // Create sample activities
    const today = new Date().toISOString().split('T')[0];
    const activities: Activity[] = [
      {
        id: 1,
        tripId: 1,
        title: "Golden Gate Bridge Tour",
        description: "Guided tour of the iconic Golden Gate Bridge with photo opportunities",
        startTime: "10:00",
        endTime: "12:00",
        date: today,
        location: "Golden Gate Bridge Welcome Center",
        type: "tour",
        status: "scheduled"
      },
      {
        id: 2,
        tripId: 1,
        title: "Fisherman's Wharf Lunch",
        description: "Seafood lunch at Pier 39 with harbor views",
        startTime: "13:00",
        endTime: "14:30",
        date: today,
        location: "Pier 39, Fisherman's Wharf",
        type: "dining",
        status: "scheduled"
      },
      {
        id: 3,
        tripId: 1,
        title: "Alcatraz Island Tour",
        description: "Audio tour of the historic Alcatraz prison",
        startTime: "16:00",
        endTime: "18:00",
        date: today,
        location: "Alcatraz Island",
        type: "tour",
        status: "scheduled"
      }
    ];
    activities.forEach(activity => this.activities.set(activity.id, activity));

    // Create sample chat messages
    const now = new Date();
    const chatMessages: ChatMessage[] = [
      {
        id: 1,
        userId: 1,
        tripId: 1,
        message: "Good morning Maya! I hope you're excited about your Golden Gate Bridge tour today. The weather looks perfect! 🌤️",
        sender: "agent",
        agentName: "Sarah",
        timestamp: new Date(now.getTime() - 180000).toISOString(),
        isRead: true
      },
      {
        id: 2,
        userId: 1,
        tripId: 1,
        message: "Hi Sarah! Yes, I'm really looking forward to it. Quick question - is there a good coffee shop near the tour starting point?",
        sender: "user",
        agentName: null,
        timestamp: new Date(now.getTime() - 120000).toISOString(),
        isRead: true
      },
      {
        id: 3,
        userId: 1,
        tripId: 1,
        message: "Absolutely! Blue Bottle Coffee is just 2 blocks away. I'll send you the exact location. They open at 9:30 AM ☕",
        sender: "agent",
        agentName: "Sarah",
        timestamp: new Date(now.getTime() - 60000).toISOString(),
        isRead: false
      }
    ];
    chatMessages.forEach(msg => this.chatMessages.set(msg.id, msg));

    // Create sample notifications
    const notifications: Notification[] = [
      {
        id: 1,
        userId: 1,
        tripId: 1,
        title: "Weather Update",
        message: "Light winds expected during your bridge tour - perfect conditions!",
        type: "info",
        isRead: false,
        createdAt: new Date(now.getTime() - 300000).toISOString()
      },
      {
        id: 2,
        userId: 1,
        tripId: 1,
        title: "Schedule Reminder",
        message: "Your lunch reservation is confirmed for 1:00 PM",
        type: "success",
        isRead: false,
        createdAt: new Date(now.getTime() - 240000).toISOString()
      },
      {
        id: 3,
        userId: 1,
        tripId: 1,
        title: "Tour Reminder",
        message: "Your Golden Gate Bridge tour starts in 30 minutes",
        type: "warning",
        isRead: false,
        createdAt: new Date(now.getTime() - 30000).toISOString()
      }
    ];
    notifications.forEach(notif => this.notifications.set(notif.id, notif));

    // Create sample support requests
    const supportRequests: SupportRequest[] = [
      {
        id: 1,
        userId: 1,
        tripId: 1,
        type: "assistance",
        title: "Restaurant Recommendation",
        description: "Looking for a good coffee shop near Golden Gate Bridge",
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
        title: "Weather Update Request",
        description: "Need current weather conditions for outdoor activities",
        status: "in_progress",
        priority: "normal",
        assignedAgent: "Sarah",
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
        resolvedAt: null
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
    const feedback: Feedback = { ...insertFeedback, id };
    this.feedbacks.set(id, feedback);
    return feedback;
  }
}

export const storage = new DatabaseStorage();
