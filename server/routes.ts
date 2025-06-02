import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, insertSupportRequestSchema, insertNotificationSchema, 
  insertFeedbackSchema, insertActivitySchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections
  const activeConnections = new Map<number, WebSocket>();

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join') {
          activeConnections.set(data.userId, ws);
          console.log(`User ${data.userId} joined chat`);
        } else if (data.type === 'chat_message') {
          // Save message and broadcast
          const savedMessage = await storage.createChatMessage({
            userId: data.userId,
            tripId: data.tripId,
            message: data.message,
            sender: 'user',
            agentName: null,
            timestamp: new Date().toISOString(),
            isRead: false
          });

          // Simulate agent response after a delay
          setTimeout(async () => {
            const agentResponse = await storage.createChatMessage({
              userId: data.userId,
              tripId: data.tripId,
              message: getAgentResponse(data.message),
              sender: 'agent',
              agentName: 'Sarah',
              timestamp: new Date().toISOString(),
              isRead: false
            });

            // Send agent response back
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'chat_message',
                message: agentResponse
              }));
            }
          }, 1000 + Math.random() * 2000);

          // Echo user message back
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'chat_message',
              message: savedMessage
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Remove from active connections
      for (const [userId, connection] of activeConnections.entries()) {
        if (connection === ws) {
          activeConnections.delete(userId);
          break;
        }
      }
    });
  });

  // Helper function for agent responses
  function getAgentResponse(userMessage: string): string {
    const responses = [
      "I'll help you with that right away! Let me check the details for you.",
      "That's a great question! I'm looking into the best options for you.",
      "I understand your concern. Let me get you the information you need.",
      "Perfect! I've found some excellent recommendations for you.",
      "Thank you for reaching out! I'm here to make sure you have the best experience.",
      "I'll take care of that for you immediately. You should see an update shortly.",
      "Great choice! I'll make sure everything is arranged perfectly for you."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // API Routes

  // Get current user (authentication based on role)
  app.get("/api/user", async (req, res) => {
    try {
      // In a real app, you'd get user ID from JWT token or session
      const userId = parseInt(req.query.userId as string) || 1;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Agent routes
  app.get("/api/agent/assigned-travelers", async (req, res) => {
    try {
      const agentId = parseInt(req.query.agentId as string) || 2;
      const travelers = await storage.getAssignedTravelers(agentId);
      res.json(travelers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get assigned travelers" });
    }
  });

  app.get("/api/agent/stats", async (req, res) => {
    try {
      const agentId = parseInt(req.query.agentId as string) || 2;
      const stats = await storage.getAgentStats(agentId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get agent stats" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get system stats" });
    }
  });

  app.get("/api/admin/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get agents" });
    }
  });

  app.get("/api/admin/travelers", async (req, res) => {
    try {
      const travelers = await storage.getAllTravelers();
      res.json(travelers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get travelers" });
    }
  });

  // Assignment management
  app.post("/api/admin/assign-agent", async (req, res) => {
    try {
      const { travelerId, agentId } = req.body;
      await storage.assignAgentToTraveler(travelerId, agentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign agent" });
    }
  });

  // Get user's active trip
  app.get("/api/trip/active", async (req, res) => {
    try {
      const trip = await storage.getUserActiveTrip(1); // Mock user ID 1
      if (!trip) {
        return res.status(404).json({ message: "No active trip found" });
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to get active trip" });
    }
  });

  // Get today's activities
  app.get("/api/activities/today", async (req, res) => {
    try {
      const trip = await storage.getUserActiveTrip(1);
      if (!trip) {
        return res.status(404).json({ message: "No active trip found" });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const activities = await storage.getTodayActivities(trip.id, today);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get today's activities" });
    }
  });

  // Get chat messages for trip
  app.get("/api/chat/messages/:tripId", async (req, res) => {
    try {
      const tripId = parseInt(req.params.tripId);
      const messages = await storage.getChatMessagesByTrip(tripId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat messages" });
    }
  });

  // Mark messages as read
  app.post("/api/chat/read/:tripId", async (req, res) => {
    try {
      const tripId = parseInt(req.params.tripId);
      await storage.markMessagesAsRead(1, tripId); // Mock user ID 1
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Get unread message count
  app.get("/api/chat/unread-count", async (req, res) => {
    try {
      const count = await storage.getUnreadMessageCount(1); // Mock user ID 1
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // Get notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(1); // Mock user ID 1
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  // Get unread notifications
  app.get("/api/notifications/unread", async (req, res) => {
    try {
      const notifications = await storage.getUnreadNotifications(1); // Mock user ID 1
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Get support requests
  app.get("/api/support-requests", async (req, res) => {
    try {
      const requests = await storage.getSupportRequestsByUser(1); // Mock user ID 1
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get support requests" });
    }
  });

  // Create support request
  app.post("/api/support-requests", async (req, res) => {
    try {
      const data = insertSupportRequestSchema.parse(req.body);
      const request = await storage.createSupportRequest({
        ...data,
        userId: 1, // Mock user ID 1
        createdAt: new Date().toISOString()
      });
      
      // Create notification for new support request
      await storage.createNotification({
        userId: 1,
        tripId: request.tripId,
        title: "Support Request Created",
        message: `Your ${request.type} request has been received and will be handled shortly.`,
        type: "info",
        createdAt: new Date().toISOString()
      });

      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create support request" });
      }
    }
  });

  // Create feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback({
        ...data,
        userId: 1, // Mock user ID 1
        date: new Date().toISOString().split('T')[0]
      });
      res.json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create feedback" });
      }
    }
  });

  // Emergency SOS endpoint
  app.post("/api/emergency/sos", async (req, res) => {
    try {
      const { location, description } = req.body;
      
      // Create emergency support request
      const request = await storage.createSupportRequest({
        userId: 1, // Mock user ID 1
        tripId: 1, // Current trip
        type: "emergency",
        title: "Emergency SOS Request",
        description: description || "Emergency assistance requested",
        priority: "emergency",
        status: "open",
        assignedAgent: "Emergency Team",
        createdAt: new Date().toISOString()
      });

      // Create urgent notification
      await storage.createNotification({
        userId: 1,
        tripId: 1,
        title: "🚨 Emergency Response Activated",
        message: "Emergency services have been contacted. A support agent will call you within 60 seconds.",
        type: "alert",
        createdAt: new Date().toISOString()
      });

      res.json({ 
        success: true, 
        message: "Emergency services contacted! A support agent will call you within 60 seconds.",
        requestId: request.id 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process emergency request" });
    }
  });

  // Update activity status
  app.patch("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const activity = await storage.updateActivity(id, updates);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to update activity" });
    }
  });

  return httpServer;
}
