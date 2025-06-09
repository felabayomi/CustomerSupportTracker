import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, insertSupportRequestSchema, insertNotificationSchema, 
  insertFeedbackSchema, insertActivitySchema 
} from "@shared/schema";
import { z } from "zod";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const publicWss = new WebSocketServer({ server: httpServer, path: '/public-ws' });
  
  // Store active WebSocket connections
  const activeConnections = new Map<number, WebSocket>();
  const publicConnections = new Map<string, WebSocket>();
  const publicChatSessions = new Map<string, {
    sessionId: string;
    websiteUrl: string;
    isActive: boolean;
    lastActivity: string;
    messages: Array<{
      id: string;
      message: string;
      sender: 'user' | 'agent';
      timestamp: string;
      agentName?: string;
    }>;
  }>();

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
          
          // Create or update session
          const session = {
            sessionId: data.sessionId,
            websiteUrl: data.websiteUrl || 'unknown',
            isActive: true,
            lastActivity: new Date().toISOString(),
            messages: []
          };
          publicChatSessions.set(data.sessionId, session);
          
          console.log(`Public session ${data.sessionId} joined from ${data.websiteUrl}`);
        } else if (data.type === 'public_chat_message') {
          // Store user message
          const userMessage = {
            id: `user_${Date.now()}`,
            message: data.message,
            sender: 'user' as const,
            timestamp: new Date().toISOString()
          };
          
          const session = publicChatSessions.get(data.sessionId);
          if (session) {
            session.messages.push(userMessage);
            session.lastActivity = new Date().toISOString();
            publicChatSessions.set(data.sessionId, session);
          }
          
          // Start 5-minute timer for contact prompt (if no agent responds)
          scheduleContactPrompt(data.sessionId, ws);
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
          // Mark session as inactive
          const session = publicChatSessions.get(sessionId);
          if (session) {
            session.isActive = false;
            publicChatSessions.set(sessionId, session);
          }
          break;
        }
      }
    });
  });

  // Create a test session for demonstration
  const testSession = {
    sessionId: 'test_session_123',
    websiteUrl: 'citydiscoverer.ai',
    isActive: true,
    lastActivity: new Date().toISOString(),
    messages: [
      {
        id: 'msg_1',
        message: 'Hi! I\'m interested in your city tours in San Francisco.',
        sender: 'user' as const,
        timestamp: new Date(Date.now() - 180000).toISOString()
      },
      {
        id: 'msg_2',
        message: 'Great! I can help you with that. What dates are you looking at?',
        sender: 'agent' as const,
        timestamp: new Date(Date.now() - 120000).toISOString(),
        agentName: 'AI Assistant'
      },
      {
        id: 'msg_3',
        message: 'I was thinking about next weekend. Do you have any availability?',
        sender: 'user' as const,
        timestamp: new Date(Date.now() - 60000).toISOString()
      }
    ]
  };
  publicChatSessions.set(testSession.sessionId, testSession);



  // Public chat API routes
  app.get("/api/public-chat/sessions", (req, res) => {
    const sessions = Array.from(publicChatSessions.values()).map(session => ({
      ...session,
      unreadCount: session.messages.filter(msg => msg.sender === 'user').length
    }));
    res.json(sessions);
  });

  // Handle public chat messages from embeddable widget
  app.post("/api/public-chat/message", async (req, res) => {
    try {
      const { sessionId, message, websiteUrl } = req.body;
      
      // Create or get session
      let session = publicChatSessions.get(sessionId);
      if (!session) {
        session = {
          sessionId,
          websiteUrl: websiteUrl || 'unknown',
          isActive: true,
          lastActivity: new Date().toISOString(),
          messages: []
        };
        publicChatSessions.set(sessionId, session);
      }

      // Store user message
      const userMessage = {
        id: `user_${Date.now()}`,
        message,
        sender: 'user' as const,
        timestamp: new Date().toISOString()
      };
      
      session.messages.push(userMessage);
      session.lastActivity = new Date().toISOString();
      publicChatSessions.set(sessionId, session);

      // Generate agent response immediately
      const agentResponse = getPublicAgentResponse(message);
      const agentMessage = {
        id: `agent_${Date.now()}`,
        message: agentResponse,
        sender: 'agent' as const,
        timestamp: new Date().toISOString(),
        agentName: 'City Discoverer'
      };

      // Add agent response
      session.messages.push(agentMessage);
      session.lastActivity = new Date().toISOString();
      publicChatSessions.set(sessionId, session);

      // Schedule contact prompt if no further agent response in 5 minutes
      setTimeout(() => {
        const session = publicChatSessions.get(sessionId);
        if (session) {
          const contactMessage = {
            id: `contact_${Date.now()}`,
            message: "I'd love to help you further! Please share your email or phone number so I can send you personalized recommendations and contact you within 24 hours with exclusive deals.",
            sender: 'agent' as const,
            timestamp: new Date().toISOString(),
            agentName: 'City Discoverer'
          };
          session.messages.push(contactMessage);
          publicChatSessions.set(sessionId, session);
        }
      }, 300000); // 5 minutes

      res.json({ 
        success: true, 
        response: agentMessage
      });
    } catch (error) {
      console.error('Public chat message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/public-chat/send", async (req, res) => {
    try {
      const { sessionId, message, agentName } = req.body;
      
      const session = publicChatSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Clear contact prompt timeout when agent responds
      if (agentResponseTimeouts.has(sessionId)) {
        clearTimeout(agentResponseTimeouts.get(sessionId));
        agentResponseTimeouts.delete(sessionId);
      }

      const agentMessage = {
        id: `agent_${Date.now()}`,
        message,
        sender: 'agent' as const,
        timestamp: new Date().toISOString(),
        agentName: agentName || 'Support Agent'
      };

      // Add message to session
      session.messages.push(agentMessage);
      session.lastActivity = new Date().toISOString();
      publicChatSessions.set(sessionId, session);

      // Send message to the connected user if they're still connected
      const ws = publicConnections.get(sessionId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'public_chat_message',
          message: agentMessage
        }));
      }

      res.json({ success: true, message: agentMessage });
    } catch (error) {
      console.error('Error sending public chat message:', error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });



  app.get('/api/public-chat/messages/:sessionId', (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = publicChatSessions.get(sessionId);
      
      if (!session) {
        return res.json({ messages: [] });
      }

      res.json({ messages: session.messages });
    } catch (error) {
      console.error('HTTP messages fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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

  // Store agent response timeouts to track when to prompt for contact info
  const agentResponseTimeouts = new Map<string, NodeJS.Timeout>();

  // Helper function for public chat agent responses
  function getPublicAgentResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Human escalation requests (highest priority)
    if (message.includes('agent') || message.includes('representative') || message.includes('human') || 
        message.includes('live person') || message.includes('speak to someone') || message.includes('real person')) {
      return "I understand you'd like to speak with a live agent. Let me connect you with one of our travel specialists who can provide personalized assistance. Please hold on while I transfer your chat.";
    }
    
    // Activity-based inquiries (check these first for more specific matches)
    if (message.includes('hotel') || message.includes('accommodation') || message.includes('stay')) {
      return "I can help you find great accommodation! What's your budget range and preferred area? Do you need family-friendly options or business amenities?";
    }
    
    if (message.includes('flight') || message.includes('airline') || message.includes('booking')) {
      return "For flight bookings, I can help you find the best deals! What are your departure and destination cities, and when are you planning to travel?";
    }
    
    if (message.includes('restaurant') || message.includes('food') || message.includes('dining')) {
      return "Food is one of the best parts of travel! Are you looking for local specialties, fine dining, or casual eateries? Any dietary preferences I should know about?";
    }
    
    if (message.includes('itinerary') || message.includes('plan') || message.includes('schedule')) {
      return "I'd love to help you create the perfect itinerary! How many days will you be traveling, and what are your main interests - history, culture, food, or adventure?";
    }
    
    if (message.includes('budget') || message.includes('cost') || message.includes('price')) {
      return "Budget planning is crucial for great trips! What's your approximate budget, and would you like tips on saving money while still having amazing experiences?";
    }
    
    // Travel destination inquiries
    if (message.includes('paris') || message.includes('france')) {
      return "Paris is amazing! I'd recommend visiting the Eiffel Tower, Louvre Museum, and exploring Montmartre. How many days are you planning to stay?";
    }
    
    if (message.includes('tokyo') || message.includes('japan')) {
      return "Tokyo offers incredible experiences! Don't miss Shibuya Crossing, traditional temples in Asakusa, and amazing food in Harajuku. What interests you most?";
    }
    
    if (message.includes('new york') || message.includes('nyc')) {
      return "New York City has so much to offer! Central Park, Times Square, Brooklyn Bridge, and world-class museums. Are you looking for cultural activities or entertainment?";
    }
    
    if (message.includes('london') || message.includes('uk') || message.includes('england')) {
      return "London is fantastic! The British Museum, Tower Bridge, and West End shows are must-sees. Would you like recommendations for specific neighborhoods?";
    }
    
    if (message.includes('rome') || message.includes('italy')) {
      return "Rome is a city steeped in history! The Colosseum, Vatican City, and Trevi Fountain are essential visits. Are you interested in historical sites or local cuisine?";
    }
    

    
    // General travel inquiries
    if (message.includes('travel') || message.includes('trip') || message.includes('vacation') || message.includes('holiday')) {
      return "I'm excited to help plan your trip! What destination are you considering, and what type of experience are you looking for?";
    }
    
    if (message.includes('recommend') || message.includes('suggest') || message.includes('advice')) {
      return "I'd be happy to provide personalized recommendations! Could you tell me more about your destination and what activities interest you most?";
    }
    
    // Greetings and general
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm here to help you discover amazing travel experiences. What destination or travel question can I assist you with today?";
    }
    
    if (message.includes('help') || message.includes('assist') || message.includes('support')) {
      return "I'm here to help with all your travel needs! Whether it's destination planning, accommodation, activities, or travel tips - what would you like to know?";
    }
    
    // Default response for unmatched messages
    return "That's an interesting question! I'd love to help you with your travel plans. Could you tell me more about what you're looking for or which destination interests you?";
  }

  // Function to prompt for contact information after 5 minutes
  function scheduleContactPrompt(sessionId: string, ws: WebSocket) {
    // Clear any existing timeout
    if (agentResponseTimeouts.has(sessionId)) {
      clearTimeout(agentResponseTimeouts.get(sessionId));
    }

    // Set new timeout for 5 minutes
    const timeout = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const contactPrompt = {
          id: `contact_prompt_${Date.now()}`,
          message: "I'd be happy to connect you with one of our travel specialists for personalized assistance. Could you please share your email or phone number? We'll reach out within 24 hours to help plan your perfect trip.",
          sender: 'agent' as const,
          timestamp: new Date().toISOString(),
          agentName: 'Support Agent'
        };

        // Store the contact prompt message
        const session = publicChatSessions.get(sessionId);
        if (session) {
          session.messages.push(contactPrompt);
          session.lastActivity = new Date().toISOString();
          publicChatSessions.set(sessionId, session);
        }

        ws.send(JSON.stringify({
          type: 'public_chat_message',
          message: contactPrompt
        }));
      }
      agentResponseTimeouts.delete(sessionId);
    }, 5 * 60 * 1000); // 5 minutes

    agentResponseTimeouts.set(sessionId, timeout);
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

  // Admin route to send travel alert
  app.post("/api/admin/send-alert", async (req, res) => {
    try {
      const { userId, title, message, type, tripId } = req.body;
      
      if (!userId || !title || !message || !type) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get user's active trip if tripId not provided
      let targetTripId = tripId;
      if (!targetTripId) {
        const activeTrip = await storage.getUserActiveTrip(parseInt(userId));
        targetTripId = activeTrip?.id || null;
      }

      const notification = await storage.createNotification({
        userId: parseInt(userId),
        tripId: targetTripId,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Send real-time notification via WebSocket if user is connected
      const userConnections = userSockets.get(parseInt(userId));
      if (userConnections && userConnections.size > 0) {
        for (const ws of userConnections) {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'notification',
              data: notification
            }));
          }
        }
      }

      res.json({ success: true, notification });
    } catch (error) {
      console.error('Send alert error:', error);
      res.status(500).json({ message: "Failed to send alert" });
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
      
      console.log("Sending response to support request:", requestId, "Message:", message);
      
      // Get the support request to find the user and trip
      const supportRequest = await storage.getSupportRequest(requestId);
      if (!supportRequest) {
        console.log("Support request not found:", requestId);
        return res.status(404).json({ message: "Support request not found" });
      }
      
      console.log("Found support request:", supportRequest);
      
      // Create a chat message as the agent response
      const chatMessage = await storage.createChatMessage({
        userId: supportRequest.userId,
        tripId: supportRequest.tripId,
        message: message,
        sender: "agent",
        agentName: "Support Agent",
        timestamp: new Date().toISOString(),
        isRead: false
      });
      
      console.log("Created chat message:", chatMessage);
      
      // Create a notification for the customer
      const notification = await storage.createNotification({
        userId: supportRequest.userId,
        tripId: supportRequest.tripId,
        title: "Response to Your Support Request",
        message: `We've responded to your ${supportRequest.type} request.`,
        type: "info",
        createdAt: new Date().toISOString()
      });
      
      console.log("Created notification:", notification);
      
      // Update support request status if it's still open
      if (supportRequest.status === "open") {
        const updatedRequest = await storage.updateSupportRequest(requestId, { 
          status: "in_progress",
          assignedAgent: "Support Team"
        });
        console.log("Updated support request:", updatedRequest);
      }
      
      res.json({ success: true, message: "Response sent successfully" });
    } catch (error) {
      console.error("Error sending response:", error);
      res.status(500).json({ message: "Failed to send response", error: error.message });
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

  // Assign agent to traveler
  app.post("/api/admin/assign-agent", async (req, res) => {
    try {
      const { travelerId, agentId } = req.body;
      await storage.assignAgentToTraveler(travelerId, agentId);
      res.json({ success: true, message: "Agent assigned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign agent" });
    }
  });

  // Create customer and link access code
  app.post("/api/admin/create-customer", async (req, res) => {
    try {
      const { 
        name, 
        email, 
        phone, 
        accessCode, 
        preferences, 
        itineraries,
        tripTitle,
        destination,
        startDate,
        endDate,
        tripDescription
      } = req.body;
      
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

      // Create main trip if trip details are provided
      if (tripTitle && destination && startDate && endDate) {
        await storage.createTrip({
          userId: user.id,
          title: tripTitle,
          destination: destination,
          startDate: startDate,
          endDate: endDate,
          status: "active",
          description: tripDescription || `Trip to ${destination}`
        });
      }

      // Create additional trips for each itinerary (legacy support)
      for (let i = 0; i < itineraries.length; i++) {
        if (itineraries[i].trim()) {
          await storage.createTrip({
            userId: user.id,
            title: `Additional Scenario ${i + 1}`,
            destination: "Custom Itinerary",
            startDate: startDate || new Date().toISOString().split('T')[0],
            endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      // Validate input with schema (excludes userId and date)
      const data = insertFeedbackSchema.parse(req.body);
      const userId = (req.session as any)?.userId || parseInt(req.query.userId as string) || 6; // Default to Katty Hensen
      
      const feedback = await storage.createFeedback({
        ...data,
        userId,
        date: new Date().toISOString().split('T')[0]
      });
      
      res.json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      } else {
        console.error('Feedback creation error:', error);
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

  // Get all trips for user
  app.get("/api/trips", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || parseInt(req.query.userId as string) || 3;
      const trips = await storage.getTripsByUser(userId);
      res.json(trips);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trips" });
    }
  });

  // Create new trip
  app.post("/api/trips", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId || 3;
      const tripData = { ...req.body, userId };
      const trip = await storage.createTrip(tripData);
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  // Update trip
  app.patch("/api/trips/:id", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const userId = (req.session as any)?.userId || 3;
      
      // Verify trip belongs to user
      const existingTrip = await storage.getTrip(tripId);
      if (!existingTrip || existingTrip.userId !== userId) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      const updatedTrip = await storage.updateTrip(tripId, req.body);
      res.json(updatedTrip);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trip" });
    }
  });

  // Delete trip
  app.delete("/api/trips/:id", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const userId = (req.session as any)?.userId || 3;
      
      // Verify trip belongs to user
      const existingTrip = await storage.getTrip(tripId);
      if (!existingTrip || existingTrip.userId !== userId) {
        return res.status(404).json({ message: "Trip not found" });
      }
      
      await storage.deleteTrip(tripId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trip" });
    }
  });

  // Admin: Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const travelers = await storage.getAllTravelers();
      res.json(travelers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Admin: Get all trips
  app.get("/api/admin/trips", async (req, res) => {
    try {
      const allUsers = await storage.getAllTravelers();
      const allTrips = [];
      
      for (const user of allUsers) {
        const userTrips = await storage.getTripsByUser(user.id);
        const tripsWithUserName = userTrips.map(trip => ({
          ...trip,
          userName: user.name || user.username
        }));
        allTrips.push(...tripsWithUserName);
      }
      
      res.json(allTrips);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trips" });
    }
  });

  // Admin: Create trip for user
  app.post("/api/admin/trips", async (req, res) => {
    try {
      const trip = await storage.createTrip(req.body);
      res.json(trip);
    } catch (error) {
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  // Admin: Update trip
  app.patch("/api/admin/trips/:id", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const updatedTrip = await storage.updateTrip(tripId, req.body);
      res.json(updatedTrip);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trip" });
    }
  });

  // Admin: Delete trip
  app.delete("/api/admin/trips/:id", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      await storage.deleteTrip(tripId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trip" });
    }
  });

  return httpServer;
}
