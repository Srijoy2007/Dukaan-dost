const PRODUCT_SYNONYMS = {
  'atta': ['atta', 'आटा', 'aata', 'aatta', 'gehu', 'गेहूं'],
  'oil': ['oil', 'tel', 'तेल', 'cooking oil', 'refined oil', 'mustard oil', 'sarson', 'sarso'],
  'sugar': ['sugar', 'cheeni', 'चीनी', 'chini', 'shakkar'],
  'rice': ['rice', 'chawal', 'चावल', 'chaval'],
  'dal': ['dal', 'daal', 'दाल', 'lentils', 'moong', 'masoor', 'toor', 'arhar'],
  'milk': ['milk', 'doodh', 'दूध', 'dudh'],
  'salt': ['salt', 'namak', 'नमक', 'namk'],
  'tea': ['tea', 'chai', 'चाय', 'chay'],
  'onion': ['onion', 'pyaz', 'प्याज', 'piyaaz'],
  'potato': ['potato', 'aloo', 'aaloo', 'आलू', 'alu'],
  'tomato': ['tomato', 'tamatar', 'टमाटर'],
  'soap': ['soap', 'sabun', 'साबुन'],
  'shampoo': ['shampoo', 'shampu', 'शैंपू'],
  'detergent': ['detergent', 'surf', 'washing powder'],
  'biscuit': ['biscuit', 'biskut', 'बिस्कुट'],
  'bread': ['bread', 'double roti', 'ब्रेड'],
  'egg': ['egg', 'anda', 'अंडा', 'eggs'],
  'paneer': ['paneer', 'पनीर', 'cottage cheese'],
  'ghee': ['ghee', 'घी'],
  'turmeric': ['turmeric', 'haldi', 'हल्दी'],
  'chili_powder': ['chili powder', 'mirch', 'मिर्च', 'lal mirch', 'red chili'],
  'cumin': ['cumin', 'jeera', 'जीरा'],
  'coriander': ['coriander', 'dhaniya', 'धनिया'],
  'chips': ['chips', 'चिप्स', 'lays', 'kurkure', 'bingo', 'balaji', 'haldiram'],
  'noodles': ['noodles', 'maggi', 'मैगी', 'top ramen', 'yippee'],
  'cold_drink': ['cold drink', 'pepsi', 'coke', 'thums up', 'sprite', 'fanta', 'soda'],
};

const BRAND_SYNONYMS = {
  'lays': ['lays', 'लेस', 'lays chips'],
  'kurkure': ['kurkure', 'कुरकुरे'],
  'bingo': ['bingo', 'बिंगो'],
  'balaji': ['balaji', 'बालाजी'],
  'haldiram': ['haldiram', 'हल्दीराम'],
  'maggi': ['maggi', 'मैगी', 'maggi noodles'],
  'yippee': ['yippee', 'यिप्पी'],
  'top_ramen': ['top ramen', 'टॉप रामेन'],
  'pepsi': ['pepsi', 'पेप्सी'],
  'coke': ['coke', 'coca cola', 'कोका कोला', 'कोक'],
  'thums_up': ['thums up', 'thumsup', 'थम्स अप'],
  'sprite': ['sprite', 'स्प्राइट'],
  'fanta': ['fanta', 'फैंटा'],
  'aashirvaad': ['aashirvaad', 'आशिर्वाद', 'ashirwad'],
  'fortune': ['fortune', 'फॉर्च्यून'],
  'tata_salt': ['tata salt', 'टाटा नमक'],
};

const UNIT_SYNONYMS = {
  'kg': ['kg', 'kilo', 'kilogram', 'किलो', 'keelo', 'kilos'],
  'gram': ['gram', 'g', 'gm', 'grams', 'ग्राम'],
  'litre': ['litre', 'liter', 'l', 'ltr', 'litres', 'लीटर', 'litr'],
  'ml': ['ml', 'millilitre', 'milliliter', 'मिली'],
  'piece': ['piece', 'pieces', 'pc', 'pcs', 'packet', 'pack', 'box', 'bottle', 'bottles', 'पीस', 'पैकेट'],
  'dozen': ['dozen', 'doz', 'दर्जन']
};

const ORDER_INTENTS = [
  'bhej do', 'bhejdo', 'bhejo', 'send', 'order', 'chahiye', 'chahie', 'dena', 'de do', 'dedo',
  'laana', 'lana', 'laao', 'lao', 'dijiye', 'dijie', 'bhijwa do', 'bhijwado',
  'bhej', 'deliver', 'bhijwao', 'mangwana', 'mangwao', 'chahiye tha', 'mangwao', 'lao bhaiya'
];

const NEGATION_PATTERNS = [
  'nahi chahiye', 'nahi chahye', 'mat bhejo', 'mat bhej', 'cancel', 'rehne do',
  'nahi lena', 'nahi lena hai', 'skip', 'no need', "don't send", 'not needed', 'band karo'
];

const INQUIRY_INTENTS = {
  'daily_sales': ['aaj kitna bikaa', 'aaj kitna bika', 'today sales', 'aaj ka hisaab', 'aaj ka business',
    'kitna hua aaj', 'aaj ka collection', 'today collection', 'aaj ki kamai', 'aaj kitna hua', 'aaj ka report'],
  'stock_check': ['stock check', 'stock check karo', 'kitna bacha hai', 'stock kitna hai',
    'samaan kitna hai', 'stock status', 'bacha hua', 'kitna stock', 'stock batao', 'maal kitna hai'],
  'pending_payments': ['pending payment', 'kaun payment nahi kiya', 'paisa nahi aaya',
    'baki paisa', 'baki payment', 'udhar kitna hai', 'kaun udhar hai', 'pending paisa',
    'payment nahi mila', 'kitna baki hai', 'baki kitna'],
  'weekly_report': ['is hafte ka report', 'weekly report', 'hafte ka hisaab', 'saptahik report',
    'week summary', 'is week kitna hua'],
  'customer_count': ['kitne customer', 'customer kitne', 'mere customer', 'total customer',
    'kitne log aate hain'],
  'top_products': ['sabse zyada kya bik raha', 'top product', 'sabse bikne wala',
    'kya bik raha hai', 'sabse demand', 'zyada bikne wala', 'sabse jyada'],
  'order_status': ['order kaha hai', 'mera order', 'order status', 'kab aayega', 'delivery kab']
};

const ITEM_SPLIT_REGEX = /\s*(?:,|;|\+|\baur\b|\band\b)\s*/i;

const HINDI_NUMBERS = {
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
  'chhe': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
  'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
  'solah': 16, 'satrah': 17, 'atharah': 18, 'unnis': 19, 'bees': 20,
  'aadha': 0.5, 'pauna': 0.75, 'sawa': 1.25
};

const extractNumber = (text) => {
  const digitMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (digitMatch) return parseFloat(digitMatch[1]);

  const lowerText = text.toLowerCase();
  for (const [word, num] of Object.entries(HINDI_NUMBERS)) {
    const re = new RegExp(`\\b${word}\\b`);
    if (re.test(lowerText)) return num;
  }
  return null;
};

const detectProduct = (text) => {
  const lowerText = text.toLowerCase();
  for (const [product, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (lowerText.includes(synonym.toLowerCase())) {
        return product;
      }
    }
  }
  return null;
};

const detectBrand = (text) => {
  const lowerText = text.toLowerCase();
  for (const [brand, synonyms] of Object.entries(BRAND_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (lowerText.includes(synonym.toLowerCase())) {
        return brand;
      }
    }
  }
  return null;
};

const detectUnit = (text) => {
  const lowerText = text.toLowerCase();
  for (const [unit, synonyms] of Object.entries(UNIT_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (lowerText.includes(synonym.toLowerCase())) {
        return unit;
      }
    }
  }
  return 'piece';
};

const isNegated = (text) => {
  const lowerText = text.toLowerCase();
  return NEGATION_PATTERNS.some((p) => lowerText.includes(p));
};

const detectIntent = (text) => {
  const lowerText = text.toLowerCase();

  if (isNegated(lowerText)) {
    return { type: 'negation', subtype: 'cancel_or_decline' };
  }

  for (const [intent, keywords] of Object.entries(INQUIRY_INTENTS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return { type: 'inquiry', subtype: intent };
      }
    }
  }

  for (const keyword of ORDER_INTENTS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return { type: 'order', subtype: 'place_order' };
    }
  }

  if (detectProduct(text)) {
    return { type: 'order', subtype: 'place_order' };
  }

  return { type: 'unknown', subtype: 'unknown' };
};

// "bhej do", "kar do", "de do", "la do" use "do" as a command particle
// ("send/do it"), not the number two — but the Hindi-number matcher can't
// tell that apart from "do kilo" (two kilos). Strip known imperative
// endings before extracting quantity so "atta bhej do" isn't misread as
// "2 atta".
const IMPERATIVE_DO_REGEX = /\b(bhej|de|kar|la|daal|bhijwa)\s*do\b/gi;

const extractItems = (text) => {
  const chunks = text.split(ITEM_SPLIT_REGEX).filter(Boolean);
  const items = [];
  const unresolvedChunks = [];

  for (const chunk of chunks) {
    const product = detectProduct(chunk);
    if (!product) {
      if (detectUnit(chunk) !== 'piece' || extractNumber(chunk) !== null) {
        unresolvedChunks.push(chunk.trim());
      }
      continue;
    }
    const quantityText = chunk.replace(IMPERATIVE_DO_REGEX, ' ');
    const quantity = extractNumber(quantityText);
    const unit = detectUnit(chunk);
    const brand = detectBrand(chunk);
    items.push({
      product,
      quantity: quantity ?? 1,
      unit,
      brand,
      quantityInferred: quantity === null
    });
  }

  return { items, unresolvedChunks };
};



const parseMessage = (text, sessionContext = null) => {
  if (sessionContext && sessionContext.state === 'awaiting_quantity') {
    const qty = extractNumber(text);
    const unit = detectUnit(text);
    if (qty !== null && sessionContext.context.partialOrder?.items?.length > 0) {
      const updatedItems = sessionContext.context.partialOrder.items.map(item => ({
        ...item,
        quantity: qty,
        unit: unit || item.unit,
        quantityInferred: false
      }));
      return {
        intent: 'order',
        items: updatedItems,
        originalText: text,
        confidence: 0.9,
        needsClarification: false,
        source: 'session_quantity_fill'
      };
    }
  }

  if (sessionContext && sessionContext.state === 'awaiting_brand') {
    const brand = detectBrand(text);
    const product = detectProduct(text); // user might say "Lays" or "Lays chips"
    
    if (brand || product) {
      const updatedItems = sessionContext.context.partialOrder.items.map(item => ({
        ...item,
        brand: brand || item.brand,
        product: product || item.product
      }));
      return {
        intent: 'order',
        items: updatedItems,
        originalText: text,
        confidence: 0.9,
        needsClarification: false,
        source: 'session_brand_fill'
      };
    }
    
    // If they just said a brand name like "Lays" with no product keyword
    if (brand && sessionContext.context.partialOrder?.items?.length > 0) {
      const updatedItems = sessionContext.context.partialOrder.items.map(item => ({
        ...item,
        brand
      }));
      return {
        intent: 'order',
        items: updatedItems,
        originalText: text,
        confidence: 0.85,
        needsClarification: false,
        source: 'session_brand_fill'
      };
    }
  }

  const intent = detectIntent(text);

  if (intent.type === 'negation') {
    return {
      intent: 'negation',
      originalText: text,
      confidence: 0.85,
      response: 'Theek hai, cancel kar diya. Kuch aur chahiye?'
    };
  }

  if (intent.type === 'inquiry') {
    return {
      intent: 'inquiry',
      inquiryType: intent.subtype,
      originalText: text,
      items: [],
      confidence: 0.9
    };
  }

  if (intent.type === 'order') {
    const { items, unresolvedChunks } = extractItems(text);

    if (items.length === 0) {
      return {
        intent: 'order',
        items: [],
        originalText: text,
        confidence: 0.3,
        needsClarification: true,
        clarificationType: 'product_unknown',
        clarificationQuestion: 'Kya samaan chahiye? Product ka naam bataiye. Jaise: 2kg atta, 1 litre oil'
      };
    }

    const anyInferredQty = items.some((i) => i.quantityInferred);
    if (anyInferredQty) {
      const names = items.filter((i) => i.quantityInferred).map((i) => i.product).join(', ');
      return {
        intent: 'order',
        items,
        originalText: text,
        confidence: 0.6,
        needsClarification: true,
        clarificationType: 'quantity_missing',
        clarificationQuestion: `Kitna ${names} chahiye? Quantity bataiye.`
      };
    }

    // Check if brand is needed but missing for ambiguous products
    const needsBrand = items.some(item => {
      const needs = ['chips', 'noodles', 'cold_drink', 'detergent', 'shampoo'];
      return needs.includes(item.product) && !item.brand;
    });

    if (needsBrand) {
      const ambiguous = items.filter(i => {
        const needs = ['chips', 'noodles', 'cold_drink', 'detergent', 'shampoo'];
        return needs.includes(i.product) && !i.brand;
      }).map(i => i.product).join(', ');
      
      return {
        intent: 'order',
        items,
        originalText: text,
        confidence: 0.7,
        needsClarification: true,
        clarificationType: 'brand_missing',
        clarificationQuestion: `Aap kis brand ka ${ambiguous} maang rahe hain? Jaise: Lays, Maggi, Pepsi...`
      };
    }

    return {
      intent: 'order',
      items,
      originalText: text,
      confidence: unresolvedChunks.length ? 0.8 : 0.95,
      needsClarification: false,
      unresolvedChunks
    };
  }

  return {
    intent: 'unknown',
    originalText: text,
    confidence: 0.1,
    fallbackResponse: 'Samajh nahi aaya. Kripya dobara likhein ya boliye. Aap order de sakte hain ya stock/bikri/payment ke baare mein pooch sakte hain.'
  };
};

const detectLanguage = (text) => {
  const hindiChars = /[\u0900-\u097F]/;
  const lowerText = text.toLowerCase();

  if (hindiChars.test(text)) return 'hindi';
  if (/\b(kitna|kya|kaise|chahiye|bhej|dena|aaj|hafte|stock|bacha|udhar|hisaab)\b/.test(lowerText)) return 'hinglish';
  return 'english';
};

module.exports = {
  parseMessage,
  detectLanguage,
  detectProduct,
  detectUnit,
  detectBrand,
  detectIntent,
  extractNumber,
  extractItems,
  isNegated,
  PRODUCT_SYNONYMS,
  BRAND_SYNONYMS
};
