import { db } from "./server/db";
import { users, trips, activities, chatMessages, supportRequests, notifications, accessCodes } from "./shared/schema";
import { eq } from "drizzle-orm";

async function seedDatabase() {
  console.log("Seeding database...");

  // Create Expedition America traveler
  const [traveler] = await db.insert(users).values({
    username: "traveler_001",
    password: "password",
    name: "Alex Thompson",
    email: "alex.thompson@expedition-america.com",
    phone: "+1-555-0123",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
    role: "traveler",
    preferences: JSON.stringify(["Adventure activities", "local cuisine", "cultural experiences"]),
    alertsEnabled: true
  }).returning();

  // Create sample agent
  const [agent] = await db.insert(users).values({
    username: "sarah_anderson",
    password: "password",
    name: "Sarah Anderson",
    email: "sarah@felimark.com",
    phone: "+1-555-0124", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "agent",
    preferences: null,
    alertsEnabled: true
  }).returning();

  // Create admin user
  const [admin] = await db.insert(users).values({
    username: "admin_user",
    password: "password",
    name: "Admin User",
    email: "admin@felimark.com",
    phone: "+1-555-0125",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "admin",
    preferences: null,
    alertsEnabled: true
  }).returning();

  // Assign agent to traveler
  await db.update(users)
    .set({ assignedAgentId: agent.id })
    .where(eq(users.id, traveler.id));

  console.log("Created users:", traveler.name, agent.name, admin.name);

  // Create Expedition America trip
  const [trip] = await db.insert(trips).values({
    userId: traveler.id,
    title: "Pacific Coast Adventure",
    destination: "Big Sur & Monterey, CA",
    startDate: "2025-06-15",
    endDate: "2025-06-20",
    status: "active",
    description: "6-day premium expedition exploring California's stunning Pacific Coast with guided adventures and luxury accommodations."
  }).returning();

  console.log("Created trip:", trip.title);

  // Create Expedition America activities
  const today = new Date().toISOString().split('T')[0];
  await db.insert(activities).values([
    {
      tripId: trip.id,
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
      tripId: trip.id,
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
      tripId: trip.id,
      title: "Farm-to-Table Dinner at Aubergine",
      description: "Michelin-starred dining experience featuring local ingredients and wine pairings",
      startTime: "19:30",
      endTime: "22:00",
      date: today,
      location: "Aubergine Restaurant, Carmel-by-the-Sea",
      type: "dining",
      status: "scheduled"
    }
  ]);

  console.log("Created activities");

  // Create sample chat messages
  const now = new Date();
  await db.insert(chatMessages).values([
    {
      userId: traveler.id,
      tripId: trip.id,
      message: "Good morning Maya! I hope you're excited about your Golden Gate Bridge tour today. The weather looks perfect! 🌤️",
      sender: "agent",
      agentName: "Sarah",
      timestamp: new Date(now.getTime() - 180000).toISOString(),
      isRead: true
    },
    {
      userId: traveler.id,
      tripId: trip.id,
      message: "Hi Sarah! Yes, I'm really looking forward to it. Quick question - is there a good coffee shop near the tour starting point?",
      sender: "user",
      agentName: null,
      timestamp: new Date(now.getTime() - 120000).toISOString(),
      isRead: true
    },
    {
      userId: traveler.id,
      tripId: trip.id,
      message: "Absolutely! Blue Bottle Coffee is just 2 blocks away. I'll send you the exact location. They open at 9:30 AM ☕",
      sender: "agent",
      agentName: "Sarah",
      timestamp: new Date(now.getTime() - 60000).toISOString(),
      isRead: false
    }
  ]);

  console.log("Created chat messages");

  // Create sample notifications
  await db.insert(notifications).values([
    {
      userId: traveler.id,
      tripId: trip.id,
      title: "Weather Update",
      message: "Light winds expected during your bridge tour - perfect conditions!",
      type: "info",
      isRead: false,
      createdAt: new Date(now.getTime() - 300000).toISOString()
    },
    {
      userId: traveler.id,
      tripId: trip.id,
      title: "Schedule Reminder",
      message: "Your lunch reservation is confirmed for 1:00 PM",
      type: "success",
      isRead: false,
      createdAt: new Date(now.getTime() - 240000).toISOString()
    },
    {
      userId: traveler.id,
      tripId: trip.id,
      title: "Tour Reminder",
      message: "Your Golden Gate Bridge tour starts in 30 minutes",
      type: "warning",
      isRead: false,
      createdAt: new Date(now.getTime() - 30000).toISOString()
    }
  ]);

  console.log("Created notifications");

  // Create sample support requests
  await db.insert(supportRequests).values([
    {
      userId: traveler.id,
      tripId: trip.id,
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
      userId: traveler.id,
      tripId: trip.id,
      type: "assistance",
      title: "Weather Update Request",
      description: "Need current weather conditions for outdoor activities",
      status: "in_progress",
      priority: "normal",
      assignedAgent: "Sarah",
      createdAt: new Date(now.getTime() - 3600000).toISOString(),
      resolvedAt: null
    }
  ]);

  console.log("Created support requests");

  // Create sample access codes for testing
  await db.insert(accessCodes).values([
    {
      code: "31Y-818-APP-JMW",
      userId: null, // Available for assignment
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    },
    {
      code: "BSI-SZZ-QRT-789",
      userId: null, // Available for assignment
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    },
    {
      code: "DEY-QDL-MNP-456",
      userId: null, // Available for assignment
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    },
    {
      code: "ZQC-MBX-4KP-UUG",
      userId: traveler.id, // Already linked to Alex Thompson
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null
    }
  ]);

  console.log("Created access codes");
  console.log("Database seeding completed!");
}

seedDatabase().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});