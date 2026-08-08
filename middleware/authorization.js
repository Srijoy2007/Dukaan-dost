function authorizeCapability(requiredRole) {
  return async (req, res, next) => {
    const session = req.session;

    if (!session) {
      return res.status(401).json({ error: 'No session found' });
    }

    if (requiredRole === 'merchant' && !session.isMerchant) {
      const lang = session.businessPersona?.primaryLanguage || 'en';
      return res.status(403).json({
        message: formatUnauthorizedResponse(lang)
      });
    }

    if (requiredRole === 'customer' && session.isMerchant) {
      return res.status(403).json({
        message: 'This action is only for customers'
      });
    }

    next();
  };
}

function formatUnauthorizedResponse(lang) {
  const responses = {
    hi: 'Maaf kijiye, yeh jaankari sirf dukaan malik ke liye hai.',
    en: 'Sorry, this information is only for the store owner.',
    hinglish: 'Bhaiya, yeh sirf dukaan wale ke liye hai. Aap apna order pooch sakte ho.',
    tamil: 'Mannikkavum, indha varthagam kadai mudalvarukku mattum.',
    telugu: 'Kshaminchandi, ee samacharam dukana yajamaniki matrame.',
    marathi: 'Kshama kara, hi mahiti fakt dukan malakasathi ahe.',
    bengali: 'Dukkhito, ei tathyo sudhu dokaner maliker jonno.',
    gujarati: 'Khamma, a mahiti fakt dukan na malik mate che.'
  };

  return responses[lang] || responses.en;
}

function isBusinessInsight(intent) {
  return ['query_sales', 'check_stock', 'pending_payments', 'daily_sales', 'expiry_alerts'].includes(intent);
}

module.exports = {
  authorizeCapability,
  formatUnauthorizedResponse,
  isBusinessInsight
};
