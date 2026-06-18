/**
 * Dynamic Geolocation & Anti-VPN Security Verification Protocol
 * Evaluates telemetry signals to defend usdt-task.xyz from farming and bypass routers.
 */

export interface SecurityTelemetry {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_name: string;
  org: string;
  asn: string;
  isProxyOrVpn: boolean;
  reason?: string;
}

// Blocked server farms / cloud datacenters / hosting registries
const HOSTING_KEYWORDS = [
  'amazon',
  'aws',
  'google cloud',
  'google llc',
  'digitalocean',
  'digital ocean',
  'linode',
  'vultr',
  'ovh',
  'leaseweb',
  'm247',
  'datacenter',
  'data center',
  'hosting',
  'server',
  'cloud',
  'hetzner',
  'contabo',
  'scaleway',
  'choopa',
  'zenlayer',
  'cogent',
  'cloudflare',
  'fastly',
  'akamai',
  'microsoft',
  'azure',
  'alibaba',
  'oracle',
  'nordvpn',
  'expressvpn',
  'surfshark',
  'protonvpn',
  'smartproxy',
  'oxylabs',
  'tor exit',
  'tor node',
  'anonymous',
];

/**
 * Executes a live cybersecurity telemetry sweep.
 * Feeds from ipapi.co with a resilient fallback mechanism.
 */
export async function verifyUserSecurity(): Promise<SecurityTelemetry> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s limit

    // Fetch primary IP API
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP abnormal status: ${response.status}`);
    }

    const data = await response.json();
    return processSecurityData(data);

  } catch (error) {
    console.warn('[Security Sweep] ipapi.co timed out or throttled. Initiating fallback carrier api...', error);
    
    // Resilient Fallback to ipapi.co direct lookup or standard ip-api (no key JSON)
    try {
      const fallbackResponse = await fetch('https://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,isp,org,as,proxy,hosting,query');
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        
        // Structure normalized data
        return processSecurityData({
          ip: fallbackData.query || '',
          city: fallbackData.city || '',
          region: fallbackData.regionName || '',
          country: fallbackData.countryCode || '',
          country_name: fallbackData.country || '',
          org: fallbackData.org || fallbackData.isp || '',
          asn: fallbackData.as || '',
          // Direct indicators provided by fallback fields
          hosting: fallbackData.hosting,
          proxy: fallbackData.proxy,
          vpn: fallbackData.proxy
        });
      }
    } catch (fallbackError) {
      console.error('[Security Sweep] Fallback secure carrier failed as well.', fallbackError);
    }

    // Default return safe state if network is fully unavailable
    return {
      ip: 'Offline / Cached',
      city: 'Local network',
      region: 'Local network',
      country: 'LOC',
      country_name: 'Local Interface',
      org: 'Local connection',
      asn: 'Local loop',
      isProxyOrVpn: false
    };
  }
}

/**
 * Scans geolocation JSON datasets to check hosting, proxy patterns, and specific blacklists.
 */
function processSecurityData(data: any): SecurityTelemetry {
  const ip = data.ip || data.query || 'Unidentified IP';
  const city = data.city || 'Unidentified';
  const region = data.region_name || data.region || 'Unidentified';
  const country = data.country_code || data.country || 'US';
  const country_name = data.country_name || data.country || 'United States';
  const org = (data.org || data.asn || data.isp || '').toLowerCase();
  const asn = (data.asn || data.as || '').toLowerCase();

  let isProxyOrVpn = false;
  let reason = '';

  // 1. Direct flags evaluation (if the API supports it in pricing level)
  if (data.vpn === true || data.proxy === true || data.hosting === true) {
    isProxyOrVpn = true;
    reason = `API security flags triggered: ${
      [
        data.vpn ? 'VPN' : '',
        data.proxy ? 'Proxy' : '',
        data.hosting ? 'Datacenter' : ''
      ].filter(Boolean).join(' + ')
    }`;
  }

  // 2. Custom validation filters matching organizations with datacenters/proxies
  if (!isProxyOrVpn) {
    for (const keyword of HOSTING_KEYWORDS) {
      if (org.includes(keyword) || asn.includes(keyword)) {
        isProxyOrVpn = true;
        reason = `Banned operational network signature matches datacenter provider: "${keyword}"`;
        break;
      }
    }
  }

  // 3. Prevent simulated browser extensions that inject proxy fields
  const webdriverCheck = typeof navigator !== 'undefined' && (navigator.webdriver);
  if (webdriverCheck) {
    isProxyOrVpn = true;
    reason = 'Headless browser environment / WebDriver simulation detected';
  }

  return {
    ip,
    city,
    region,
    country,
    country_name,
    org: data.org || data.isp || 'Unclassified ISP',
    asn: data.asn || data.as || 'Unclassified ASN',
    isProxyOrVpn,
    reason
  };
}
