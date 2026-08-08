const {
  authorizeCapability,
  formatUnauthorizedResponse,
  isBusinessInsight
} = require('../../middleware/authorization');

describe('Authorization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { session: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('authorizeCapability', () => {
    it('should allow merchant access when isMerchant is true', async () => {
      req.session.isMerchant = true;
      const middleware = authorizeCapability('merchant');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny merchant access for customer with hinglish message', async () => {
      req.session.isMerchant = false;
      req.session.businessPersona = { primaryLanguage: 'hinglish' };
      const middleware = authorizeCapability('merchant');
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('dukaan wale')
      });
    });

    it('should deny merchant access for customer with hindi message', async () => {
      req.session.isMerchant = false;
      req.session.businessPersona = { primaryLanguage: 'hi' };
      const middleware = authorizeCapability('merchant');
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('Maaf kijiye')
      });
    });

    it('should deny access when no session exists', async () => {
      req.session = null;
      const middleware = authorizeCapability('merchant');
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No session found' });
    });

    it('should allow any role for any authenticated user', async () => {
      req.session.isMerchant = false;
      const middleware = authorizeCapability('any');
      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should deny customer-only actions for merchant', async () => {
      req.session.isMerchant = true;
      const middleware = authorizeCapability('customer');
      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should use English fallback when persona language is unknown', async () => {
      req.session.isMerchant = false;
      req.session.businessPersona = { primaryLanguage: 'french' };
      const middleware = authorizeCapability('merchant');
      await middleware(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining('Sorry')
      });
    });
  });

  describe('formatUnauthorizedResponse', () => {
    it('should return Hinglish message', () => {
      const msg = formatUnauthorizedResponse('hinglish');
      expect(msg).toContain('Bhaiya');
      expect(msg).toContain('dukaan wale');
    });

    it('should return Hindi message', () => {
      const msg = formatUnauthorizedResponse('hi');
      expect(msg).toContain('Maaf kijiye');
      expect(msg).toContain('dukaan malik');
    });

    it('should return English message', () => {
      const msg = formatUnauthorizedResponse('en');
      expect(msg).toContain('Sorry');
      expect(msg).toContain('store owner');
    });

    it('should return English for unknown language', () => {
      const msg = formatUnauthorizedResponse('xyz');
      expect(msg).toContain('Sorry');
    });

    it('should return Tamil message', () => {
      const msg = formatUnauthorizedResponse('tamil');
      expect(msg).toContain('Mannikkavum');
    });
  });

  describe('isBusinessInsight', () => {
    it('should return true for query_sales', () => {
      expect(isBusinessInsight('query_sales')).toBe(true);
    });

    it('should return true for check_stock', () => {
      expect(isBusinessInsight('check_stock')).toBe(true);
    });

    it('should return true for pending_payments', () => {
      expect(isBusinessInsight('pending_payments')).toBe(true);
    });

    it('should return false for place_order', () => {
      expect(isBusinessInsight('place_order')).toBe(false);
    });

    it('should return false for unknown intent', () => {
      expect(isBusinessInsight('random')).toBe(false);
    });
  });
});
