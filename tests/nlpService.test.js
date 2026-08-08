const {
  parseMessage,
  detectProduct,
  detectUnit,
  detectBrand,
  detectIntent,
  extractNumber,
  extractItems,
  isNegated
} = require('../services/nlpService');

describe('detectProduct', () => {
  test('detects atta from Hinglish', () => {
    expect(detectProduct('2kg atta bhej do')).toBe('atta');
  });

  test('detects product via Devanagari', () => {
    expect(detectProduct('मुझे चीनी चाहिए')).toBe('sugar');
  });

  test('detects chips via a brand word embedded in the product synonym list', () => {
    expect(detectProduct('lays packet do')).toBe('chips');
  });

  test('returns null for unrelated text', () => {
    expect(detectProduct('mujhe kuch chahiye')).toBeNull();
  });
});

describe('detectUnit', () => {
  test('detects kg', () => {
    expect(detectUnit('2kg atta')).toBe('kg');
  });

  test('defaults to piece when no unit is present', () => {
    expect(detectUnit('atta chahiye')).toBe('piece');
  });
});

describe('detectBrand', () => {
  test('detects Lays', () => {
    expect(detectBrand('Lays chips do')).toBe('lays');
  });

  test('returns null when no number is present', () => {
  expect(extractNumber('atta chahiye')).toBeNull();
    }); 
});

describe('extractNumber', () => {
  test('extracts a digit quantity', () => {
    expect(extractNumber('3kg aaloo')).toBe(3);
  });

  test('extracts a Hindi number word', () => {
    expect(extractNumber('do kilo atta')).toBe(2);
  });

  test('does not false-positive a number inside "doodh"', () => {
    // regression guard for the word-boundary fix — "do" must not match
    // inside "doodh" (milk)
    expect(extractNumber('doodh chahiye')).toBeNull();
  });

  test('returns null when no number is present', () => {
    expect(extractNumber('atta chahiye')).toBeNull();
  });
});

describe('isNegated', () => {
  test('flags "nahi chahiye"', () => {
    expect(isNegated('atta nahi chahiye')).toBe(true);
  });

  test('does not flag a normal order', () => {
    expect(isNegated('2kg atta bhej do')).toBe(false);
  });
});

describe('detectIntent', () => {
  test('classifies an inquiry (daily sales)', () => {
    expect(detectIntent('aaj kitna bikaa').type).toBe('inquiry');
  });

  test('classifies an order via explicit keyword', () => {
    expect(detectIntent('2kg atta bhej do').type).toBe('order');
  });

  test('classifies an order via bare product mention', () => {
    expect(detectIntent('atta').type).toBe('order');
  });

  test('negation takes priority over everything else', () => {
    expect(detectIntent('atta nahi chahiye').type).toBe('negation');
  });

  test('classifies unrelated text as unknown', () => {
    expect(detectIntent('good morning bhaiya').type).toBe('unknown');
  });
});

describe('extractItems — multi-item parsing', () => {
  test('splits two items joined by "aur"', () => {
    const { items } = extractItems('2kg atta aur 1 litre tel bhej do');
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ product: 'atta', quantity: 2, unit: 'kg' });
    expect(items[1]).toMatchObject({ product: 'oil', quantity: 1, unit: 'litre' });
  });

  test('marks quantity as inferred when missing', () => {
    const { items } = extractItems('atta bhej do');
    expect(items[0].quantityInferred).toBe(true);
    expect(items[0].quantity).toBe(1);
  });
});

describe('parseMessage — normal flow (no session)', () => {
  test('a full order needs no clarification', () => {
    const result = parseMessage('2kg atta bhej do');
    expect(result.intent).toBe('order');
    expect(result.needsClarification).toBe(false);
    expect(result.items[0]).toMatchObject({ product: 'atta', quantity: 2, unit: 'kg' });
  });

  test('order missing quantity asks for clarification', () => {
    const result = parseMessage('atta chahiye');
    expect(result.needsClarification).toBe(true);
    expect(result.clarificationType).toBe('quantity_missing');
  });

  test('brand-sensitive product without a brand asks for one', () => {
    const result = parseMessage('2 packet chips bhej do');
    expect(result.needsClarification).toBe(true);
    expect(result.clarificationType).toBe('brand_missing');
  });

  test('brand-sensitive product WITH a brand needs no clarification', () => {
    const result = parseMessage('2 packet Lays chips bhej do');
    expect(result.needsClarification).toBe(false);
    expect(result.items[0].brand).toBe('lays');
  });

  test('inquiry returns the correct inquiryType', () => {
    const result = parseMessage('stock check karo');
    expect(result.intent).toBe('inquiry');
    expect(result.inquiryType).toBe('stock_check');
  });

  test('negation returns a cancel response', () => {
    const result = parseMessage('atta nahi chahiye');
    expect(result.intent).toBe('negation');
  });

  test('unrelated text returns unknown with a fallback message', () => {
    const result = parseMessage('good morning bhaiya');
    expect(result.intent).toBe('unknown');
    expect(result.fallbackResponse).toBeTruthy();
  });
});

describe('parseMessage — session-aware clarification fill (regression guard)', () => {
  // IMPORTANT: these use the session shape webhook.js actually produces:
  // { state, context: { partialOrder } }. If nlpService.js still reads
  // sessionContext.partialOrder directly instead of
  // sessionContext.context.partialOrder, these two tests will FAIL —
  // that's the exact "everything says samajh nahi aaya" bug from testing.
  // Apply the fix to nlpService.js and these should go green.

  test('fills in quantity for a pending clarification', () => {
    const session = {
      state: 'awaiting_quantity',
      context: {
        partialOrder: {
          items: [{ product: 'atta', quantity: 1, unit: 'piece', quantityInferred: true }]
        }
      }
    };
    const result = parseMessage('3 kg', session);
    expect(result.needsClarification).toBe(false);
    expect(result.items[0]).toMatchObject({ product: 'atta', quantity: 3, unit: 'kg' });
  });

  test('fills in brand for a pending clarification', () => {
    const session = {
      state: 'awaiting_brand',
      context: {
        partialOrder: {
          items: [{ product: 'chips', quantity: 2, unit: 'piece', brand: null }]
        }
      }
    };
    const result = parseMessage('Lays', session);
    expect(result.needsClarification).toBe(false);
    expect(result.items[0].brand).toBe('lays');
  });
});
