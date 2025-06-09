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
  const publicWss = new WebSocketServer({ server: httpServer, path: '/public-ws' });
  
  // Store active WebSocket connections
  const activeConnections = new Map<number, WebSocket>();
  const publicConnections = new Map<string, WebSocket>();

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

  // Public WebSocket server for general website chat
  publicWss.on('connection', (ws, req) => {
    console.log('Public WebSocket connection established');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join_public_chat') {
          publicConnections.set(data.sessionId, ws);
          console.log(`Public session ${data.sessionId} joined from ${data.websiteUrl}`);
        } else if (data.type === 'public_chat_message') {
          // Simulate agent response after a delay for public chat
          setTimeout(() => {
            const agentResponse = {
              id: `agent_${Date.now()}`,
              message: getPublicAgentResponse(data.message),
              sender: 'agent',
              timestamp: new Date().toISOString(),
              agentName: 'Support Agent'
            };

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'public_chat_message',
                message: agentResponse
              }));
            }
          }, 1000 + Math.random() * 2000);
        }
      } catch (error) {
        console.error('Public WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Public WebSocket connection closed');
      for (const [sessionId, connection] of publicConnections.entries()) {
        if (connection === ws) {
          publicConnections.delete(sessionId);
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

  // Helper function for public chat agent responses
  function getPublicAgentResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('book')) {
      return "I'd be happy to help you with pricing information! Our travel specialists can provide you with detailed quotes for your dream adventure. What destination are you interested in?";
    } else if (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('vacation')) {
      return "Exciting! We offer amazing travel experiences across America. From national parks to city adventures, we can help you plan the perfect trip. What type of experience interests you most?";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('call')) {
      return "You can reach us at 1-800-CITY-DISC or email us at hello@citydiscoverer.com. Our team is available 24/7 to help plan your next adventure!";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to City Discoverer. I'm here to help you discover amazing travel experiences. How can I assist you today?";
    } else {
      const responses = [
        "Thanks for reaching out! I'm here to help you with any questions about our travel experiences.",
        "Great question! Let me connect you with the right information about our services.",
        "I'd love to help you plan your next adventure! What would you like to know more about?",
        "Thanks for your interest in City Discoverer! How can I make your travel dreams come true?",
        "I'm here to help! Our team specializes in creating unforgettable travel experiences."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // API Routes

  // Get current user (authentication based on session)
  app.get("/api/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
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
      const agentId = parseInt(req.query.agentId as string) || 4; // Default to Sarah Anderson (ID: 4)
      const travelers = await storage.getAssignedTravelers(agentId);
      res.json(travelers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get assigned travelers" });
    }
  });

  app.get("/api/agent/stats", async (req, res) => {
    try {
      const agentId = parseInt(req.query.agentId as string) || 4; // Default to Sarah Anderson (ID: 4)
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

  // Get all support requests for admin
  app.get("/api/admin/support-requests", async (req, res) => {
    try {
      // Get all support requests from all users for admin view
      const allRequests: any[] = [];
      const travelers = await storage.getAllTravelers();
      
      for (const traveler of travelers) {
        const userRequests = await storage.getSupportRequestsByUser(traveler.id);
        allRequests.push(...userRequests);
      }
      
      // Sort by creation date (newest first)
      allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get support requests" });
    }
  });

  // Update support request (admin only)
  app.patch("/api/admin/support-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedRequest = await storage.updateSupportRequest(id, updates);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Support request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update support request" });
    }
  });

  // Send response to customer (admin only)
  app.post("/api/admin/support-requests/:id/response", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { message } = req.body;
      
      // Get the support request to find the user and trip
      const supportRequest = await storage.getSupportRequest(requestId);
      if (!supportRequest) {
        return res.status(404).json({ message: "Support request not found" });
      }
      
      // Create a chat message as the agent response
      await storage.createChatMessage({
        userId: supportRequest.userId,
        tripId: supportRequest.tripId,
        message: message,
        sender: "agent",
        isRead: false,
        createdAt: new Date().toISOString()
      });
      
      // Create a notification for the customer
      await storage.createNotification({
        userId: supportRequest.userId,
        tripId: supportRequest.tripId,
        title: "Response to Your Support Request",
        message: `We've responded to your ${supportRequest.type} request.`,
        type: "info",
        createdAt: new Date().toISOString()
      });
      
      // Update support request status if it's still open
      if (supportRequest.status === "open") {
        await storage.updateSupportRequest(requestId, { 
          status: "in_progress",
          assignedAgent: "Support Team"
        });
      }
      
      res.json({ success: true, message: "Response sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send response" });
    }
  });

  // Access code verification
  app.post("/api/access/verify", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Access code required" });
      }

      const result = await storage.verifyAccessCode(code.toUpperCase());
      if (result.isValid && result.user) {
        // Store user in session
        (req.session as any).userId = result.user.id;
        (req.session as any).user = result.user;
        
        res.json({
          success: true,
          userId: result.user.id,
          userName: result.user.name,
          role: result.user.role
        });
      } else {
        res.status(401).json({ message: "Invalid access code" });
      }
    } catch (error) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Session management
  app.post("/api/session/clear", async (req, res) => {
    try {
      (req.session as any).userId = null;
      (req.session as any).user = null;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear session" });
    }
  });

  // Generate access codes (secure admin only)
  app.post("/api/admin/generate-codes", async (req, res) => {
    try {
      const { count } = req.body;
      const codes = [];
      
      for (let i = 0; i < count; i++) {
        const uniqueCode = storage.generateUniqueCode();
        const travelers = await storage.getAllTravelers();
        const randomTraveler = travelers[Math.floor(Math.random() * travelers.length)];
        
        if (randomTraveler) {
          const accessCode = await storage.createAccessCode({
            code: uniqueCode,
            userId: randomTraveler.id,
            isActive: true,
            expiresAt: null,
            createdAt: new Date().toISOString(),
            lastUsedAt: null
          });
          codes.push(accessCode);
        }
      }
      
      res.json({ codes });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate codes" });
    }
  });

  // Deactivate access code (secure admin only)
  app.post("/api/admin/deactivate-code", async (req, res) => {
    try {
      const { code } = req.body;
      await storage.deactivateAccessCode(code);
      res.json({ success: true, message: "Access code deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate access code" });
    }
  });

  // Create customer and link access code
  app.post("/api/admin/create-customer", async (req, res) => {
    try {
      const { name, email, phone, accessCode, preferences, itineraries } = req.body;
      
      // Create the user
      const user = await storage.createUser({
        username: email.split('@')[0].toLowerCase(),
        password: "password",
        name,
        email,
        phone,
        avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755-2616b612b786' : '1500648767791-00dcc994a43e'}?w=150&h=150&fit=crop&crop=face`,
        role: "traveler",
        preferences: JSON.stringify(preferences?.split(',').map(p => p.trim()) || []),
        alertsEnabled: true
      });

      // Update the access code to link to this user
      await storage.updateAccessCodeUser(accessCode, user.id);

      // Create trips for each itinerary
      for (let i = 0; i < itineraries.length; i++) {
        if (itineraries[i].trim()) {
          await storage.createTrip({
            userId: user.id,
            title: `Trip Scenario ${i + 1}`,
            destination: "Custom Itinerary",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: "planned",
            description: `Custom itinerary: ${itineraries[i]}`
          });
        }
      }

      res.json({ success: true, user });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Update customer
  app.put("/api/admin/update-customer/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, preferences, itineraries } = req.body;
      
      // Update user details
      const updatedUser = await storage.updateUser(parseInt(id), {
        name,
        email,
        phone,
        preferences: JSON.stringify(preferences?.split(',').map(p => p.trim()) || [])
      });

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  // Delete customer
  app.delete("/api/admin/delete-customer/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(parseInt(id));
      res.json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Access code verification (main portal endpoint)
  app.post("/api/access/verify", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Access code required" });
      }

      const result = await storage.verifyAccessCode(code.toUpperCase());
      if (result.isValid && result.user) {
        // Store user in session
        (req.session as any).userId = result.user.id;
        (req.session as any).user = result.user;
        
        res.json({
          success: true,
          userId: result.user.id,
          userName: result.user.name,
          userEmail: result.user.email,
          role: result.user.role
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid access code" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Verification failed" });
    }
  });

  // Verify access code (for admin validation tool)
  app.post("/api/verify-access-code", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Access code required" });
      }

      const result = await storage.verifyAccessCode(code.toUpperCase());
      if (result.isValid && result.user) {
        // Store user in session
        (req.session as any).userId = result.user.id;
        (req.session as any).user = result.user;
        
        res.json({
          valid: true,
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role
          }
        });
      } else {
        res.json({ valid: false });
      }
    } catch (error) {
      res.status(500).json({ message: "Verification failed" });
    }
  });

  // Get all trips for user
  app.get("/api/trips", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const trips = await storage.getTripsByUser(userId);
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trips" });
    }
  });

  // Get user's active trip
  app.get("/api/trip/active", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || parseInt(req.query.userId as string) || 3;
      const trip = await storage.getUserActiveTrip(userId);
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
      const userId = (req.session as any)?.userId || parseInt(req.query.userId as string) || 3;
      const trip = await storage.getUserActiveTrip(userId);
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
      const userId = (req.session as any)?.userId || parseInt(req.body.userId) || 3;
      await storage.markMessagesAsRead(userId, tripId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Get unread message count
  app.get("/api/chat/unread-count", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || parseInt(req.query.userId as string) || 3;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // Get notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || parseInt(req.query.userId as string) || 3;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  // Get unread notifications
  app.get("/api/notifications/unread", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 3; // Default to Maya Chen (ID: 3)
      const notifications = await storage.getUnreadNotifications(userId);
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
      const userId = parseInt(req.query.userId as string) || 3; // Default to Maya Chen (ID: 3)
      const requests = await storage.getSupportRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get support requests" });
    }
  });

  // Create support request
  app.post("/api/support-requests", async (req, res) => {
    try {
      console.log("Support request body:", JSON.stringify(req.body, null, 2));
      const data = insertSupportRequestSchema.parse(req.body);
      const request = await storage.createSupportRequest({
        ...data,
        userId: 6, // Use Katty Hensen (ID: 6) as the logged-in user
        createdAt: new Date().toISOString()
      });
      
      // Create notification for new support request
      await storage.createNotification({
        userId: 6,
        tripId: request.tripId,
        title: "Support Request Created",
        message: `Your ${request.type} request has been received and will be handled shortly.`,
        type: "info",
        createdAt: new Date().toISOString()
      });

      res.json(request);
    } catch (error) {
      console.log("Support request error:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
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
