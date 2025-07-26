// OnlyFans login automation endpoint for Vercel deployment

// Rate limiting for security
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // Max 10 requests per minute per IP

function rateLimit(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  const limit = rateLimitMap.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  limit.count++;
  return true;
}

// Anti-detection utilities
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getRandomViewport() {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 }
  ];
  return viewports[Math.floor(Math.random() * viewports.length)];
}

// Browser setup with anti-detection
async function createBrowser() {
  // Dynamic import for Puppeteer (ESM)
  const puppeteer = await import('puppeteer');
  let chromium;
  
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-field-trial-config',
    '--disable-back-forward-cache',
    '--disable-hang-monitor',
    '--disable-prompt-on-repost',
    '--disable-background-networking',
    '--disable-sync',
    '--metrics-recording-only',
    '--no-report-upload',
    '--disable-default-apps',
    '--mute-audio',
    '--no-default-browser-check',
    '--autoplay-policy=user-gesture-required',
    '--disable-domain-reliability',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-ipc-flooding-protection'
  ];

  const options = {
    args,
    headless: 'new',
    ignoreHTTPSErrors: true,
    ignoreDefaultArgs: ['--enable-automation'],
    defaultViewport: null
  };

  // Use Chromium for production
  if (process.env.NODE_ENV === 'production') {
    try {
      chromium = await import('@sparticuz/chromium');
      await chromium.default.font(
        'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/fonts/NotoColorEmoji.ttf'
      );
      options.executablePath = await chromium.default.executablePath();
      args.push(...chromium.default.args);
    } catch (error) {
      console.warn('Could not load chromium, falling back to default:', error.message);
    }
  }

  return await puppeteer.default.launch(options);
}

// OnlyFans login automation
async function performOnlyFansLogin(username, password, sessionId) {
  console.log(`🚀 Starting real OnlyFans login for ${username}`);
  
  const browser = await createBrowser();
  let page;
  
  try {
    page = await browser.newPage();
    const userAgent = getRandomUserAgent();
    const viewport = getRandomViewport();
    
    // Set user agent and viewport
    await page.setUserAgent(userAgent);
    await page.setViewport(viewport);
    
    // Add stealth modifications
    await page.evaluateOnNewDocument(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      
      // Mock languages and platform
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [{ name: 'Chrome PDF Plugin' }]
      });
    });
    
    // Navigate to OnlyFans login
    console.log('📱 Navigating to OnlyFans login page...');
    await page.goto('https://onlyfans.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for and click login button
    await page.waitForSelector('a[href="/login"]', { timeout: 10000 });
    await page.click('a[href="/login"]');
    
    // Wait for login form
    await page.waitForSelector('input[name="username"], input[type="email"]', { timeout: 10000 });
    
    // Fill login form
    console.log('📝 Filling login credentials...');
    const usernameField = await page.$('input[name="username"], input[type="email"]');
    const passwordField = await page.$('input[name="password"], input[type="password"]');
    
    if (!usernameField || !passwordField) {
      throw new Error('Login form fields not found');
    }
    
    // Type with human-like delays
    await usernameField.type(username, { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 500));
    await passwordField.type(password, { delay: 120 });
    
    // Submit form
    console.log('🔐 Submitting login form...');
    await page.keyboard.press('Enter');
    
    // Wait for login result
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    
    // Check if login was successful
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/error')) {
      throw new Error('Login failed - invalid credentials or security challenge');
    }
    
    // Extract session data
    console.log('🍪 Extracting session cookies and tokens...');
    const cookies = await page.cookies();
    
    // Get local storage
    const localStorage = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        storage[key] = window.localStorage.getItem(key);
      }
      return storage;
    });
    
    // Extract auth headers from network requests
    const authHeaders = {};
    
    // Try to extract CSRF token or auth token from page
    const authToken = await page.evaluate(() => {
      // Look for common auth token patterns
      const scripts = Array.from(document.scripts);
      for (const script of scripts) {
        if (script.textContent && script.textContent.includes('token')) {
          const tokenMatch = script.textContent.match(/(?:token|auth|csrf)["']?\s*:\s*["']([^"']+)["']/i);
          if (tokenMatch) return tokenMatch[1];
        }
      }
      return null;
    });
    
    if (authToken) {
      authHeaders['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Look for X-BC token (OnlyFans specific)
    const bcToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="bc-token"]');
      return meta ? meta.getAttribute('content') : null;
    });
    
    if (bcToken) {
      authHeaders['X-BC'] = bcToken;
    }
    
    // Test API access
    console.log('🧪 Testing API access...');
    try {
      const apiResponse = await page.evaluate(async () => {
        const response = await fetch('/api/2/users/me', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        return { status: response.status, ok: response.ok };
      });
      
      if (!apiResponse.ok) {
        console.warn('⚠️ API test failed, but login appears successful');
      }
    } catch (apiError) {
      console.warn('⚠️ Could not test API access:', apiError.message);
    }
    
    console.log('✅ OnlyFans login successful');
    
    return {
      success: true,
      cookies: cookies.filter(cookie => 
        cookie.domain.includes('onlyfans.com') && 
        (cookie.name.includes('session') || cookie.name.includes('auth') || cookie.name.includes('user'))
      ),
      localStorage,
      authHeaders,
      userAgent,
      sessionId
    };
    
  } catch (error) {
    console.error('❌ OnlyFans login failed:', error);
    throw error;
  } finally {
    if (page) await page.close();
    await browser.close();
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check rate limiting
  if (!rateLimit(req)) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  try {
    const { username, password, sessionId } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }
    
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session ID is required for tracking' 
      });
    }
    
    // Perform login
    const result = await performOnlyFansLogin(username, password, sessionId);
    
    res.json(result);
    
  } catch (error) {
    console.error('Login API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Login failed' 
    });
  }
}