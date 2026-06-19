import { UserProfile } from '../types';
import { api } from './supabase';

export interface LocationInfo {
  ip: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  is_vpn_proxy: boolean;
  vpn_provider?: string;
}

/**
 * Fetches real-time IP Geolocation with built-in VPN/Proxy detection.
 * Uses ipwho.is with a fallback options for maximum resilience.
 */
export async function detectLocationSecurity(): Promise<LocationInfo> {
  // Option 1: freeipapi.com (Highly reliable, CORS friendly, full HTTPS support)
  try {
    const response = await fetch('https://freeipapi.com/api/json');
    if (response.ok) {
      const data = await response.json();
      if (data && data.ipAddress) {
        return {
          ip: data.ipAddress,
          country: data.countryName || 'Unknown Country',
          country_code: data.countryCode || 'UN',
          region: data.regionName || 'Unknown Region',
          city: data.cityName || 'Unknown City',
          is_vpn_proxy: !!data.isProxy,
          vpn_provider: data.isProxy ? 'Detected Proxy/VPN Client' : undefined
        };
      }
    }
  } catch (err) {
    console.warn('[Geo-Security] Primary freeipapi.com detection failed, testing Option 2:', err);
  }

  // Option 2: ipwho.is
  try {
    const response = await fetch('https://ipwho.is/');
    if (response.ok) {
      const data = await response.json();
      if (data && data.success) {
        const isVpnProxy = !!(
          data.security?.vpn ||
          data.security?.proxy ||
          data.security?.tor ||
          data.security?.anonymous
        );
        
        return {
          ip: data.ip || '127.0.0.1',
          country: data.country || 'Unknown Country',
          country_code: data.country_code || 'UN',
          region: data.region || 'Unknown Region',
          city: data.city || 'Unknown City',
          is_vpn_proxy: isVpnProxy,
          vpn_provider: data.connection?.isp || data.connection?.org || undefined
        };
      }
    }
  } catch (err) {
    console.warn('[Geo-Security] Option 2 ipwho.is failed, testing Option 3:', err);
  }

  // Option 3: ipapi.co
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      if (data && data.ip) {
        const isp = (data.org || '').toLowerCase();
        const isSuspiciousISP = isp.includes('hosting') || 
                               isp.includes('server') || 
                               isp.includes('vpn') || 
                               isp.includes('proxy') || 
                               isp.includes('datacenter') ||
                               isp.includes('tor');
        
        return {
          ip: data.ip,
          country: data.country_name || 'Unknown Country',
          country_code: data.country_code || 'UN',
          region: data.region || 'Unknown Region',
          city: data.city || 'Unknown City',
          is_vpn_proxy: isSuspiciousISP,
          vpn_provider: data.org || undefined
        };
      }
    }
  } catch (err) {
    console.warn('[Geo-Security] Option 3 ipapi.co failed, testing Option 4:', err);
  }

  // Option 4: db-ip.com
  try {
    const response = await fetch('https://api.db-ip.com/v2/free/self');
    if (response.ok) {
      const data = await response.json();
      if (data && data.ipAddress) {
        return {
          ip: data.ipAddress,
          country: data.countryName || 'Unknown Country',
          country_code: data.countryCode || 'UN',
          region: data.stateProv || 'Unknown Region',
          city: data.city || 'Unknown City',
          is_vpn_proxy: false, // Default to false for db-ip
          vpn_provider: undefined
        };
      }
    }
  } catch (err) {
    console.warn('[Geo-Security] Option 4 db-ip.com failed, reverting to sandbox local loop:', err);
  }

  // Ultimate local safe fallback
  return {
    ip: '127.0.0.1',
    country: 'Local Development',
    country_code: 'localhost',
    region: 'Simulator',
    city: 'Local Dev Node',
    is_vpn_proxy: false,
    vpn_provider: 'Local Sandbox Network'
  };
}

/**
 * Automatically fetches location and updates the Supabase/Local User Profile.
 */
export async function autoDetectAndUpdateUserProfile(userId: string, onUpdate: (p: UserProfile) => void) {
  try {
    const geo = await detectLocationSecurity();
    const updatedProfile = await api.profiles.updateLocationMetadata(userId, {
      country: geo.country,
      country_code: geo.country_code,
      region: geo.region,
      city: geo.city,
      ip_address: geo.ip,
      is_vpn_proxy: geo.is_vpn_proxy,
      vpn_provider: geo.vpn_provider
    });
    if (updatedProfile) {
      onUpdate(updatedProfile);
    }
    return geo;
  } catch (error) {
    console.error('Failed to auto detect and update profile location:', error);
    return null;
  }
}
