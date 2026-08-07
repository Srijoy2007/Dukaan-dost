// Lightweight in-memory session store with TTL cleanup
// Fixes Bug 1 & Bug 2: Maintains conversation context per phone number

class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.ttlMs = 30 * 60 * 1000; // 30 minutes idle timeout
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  get(phone) {
    const session = this.sessions.get(phone);
    if (!session) return null;
    if (Date.now() - session.lastActivity > this.ttlMs) {
      this.sessions.delete(phone);
      return null;
    }
    return session;
  }

  create(phone) {
    const session = {
      phone,
      role: 'unknown',        // 'merchant' | 'customer' | 'unknown'
      merchantId: null,       // linked merchant ID
      state: 'idle',          // 'idle' | 'awaiting_quantity' | 'awaiting_brand' | 'awaiting_merchant_approval' | 'awaiting_approval_response'
      context: {
        partialOrder: null,   // stored parse result when clarification needed
        pendingOrderId: null, // for merchant approval tracking
        lastQuestion: null,   // what we last asked
        lastIntent: null,
        originalText: null,
        customerPhone: null,
      },
      lastActivity: Date.now()
    };
    this.sessions.set(phone, session);
    return session;
  }

  update(phone, updates) {
    const session = this.get(phone) || this.create(phone);
    Object.assign(session, updates);
    session.lastActivity = Date.now();
    this.sessions.set(phone, session);
    return session;
  }

  set(phone, session) {
    session.lastActivity = Date.now();
    this.sessions.set(phone, session);
  }

  delete(phone) {
    this.sessions.delete(phone);
  }

  cleanup() {
    const now = Date.now();
    for (const [phone, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.ttlMs) {
        this.sessions.delete(phone);
      }
    }
  }
}

module.exports = new SessionStore();
