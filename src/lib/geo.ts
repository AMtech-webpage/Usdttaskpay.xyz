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
  try {
    const response = await fetch('https://ipwho.is/');
    if (!response.ok) {
      throw new Error(`ipwho.is response status: ${response.status}`);
    }
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
    throw new Error('ipwho.is returned success=false');
  } catch (err) {
    console.warn('Primary geolocation method (ipwho.is) failed, invoking fallback: ', err);
    try {
      // Fallback 1: ipapi.co
      const fallbackResponse = await fetch('https://ipapi.co/json/');
      if (!fallbackResponse.ok) {
        throw new Error(`ipapi.co response status: ${fallbackResponse.status}`);
      }
      const data = await fallbackResponse.json();
      
      // Heuristic detection: check if organization/ISP includes hosting or typical VPN markers
      const isp = (data.org || '').toLowerCase();
      const isSuspiciousISP = isp.includes('hosting') || 
                             isp.includes('server') || 
                             isp.includes('vpn') || 
                             isp.includes('proxy') || 
                             isp.includes('datacenter') ||
                             isp.includes('tor');
      
      return {
        ip: data.ip || '127.0.0.1',
        country: data.country_name || 'Unknown Country',
        country_code: data.country_code || 'UN',
        region: data.region || 'Unknown Region',
        city: data.city || 'Unknown City',
        is_vpn_proxy: isSuspiciousISP,
        vpn_provider: data.org || undefined
      };
    } catch (err2) {
      console.warn('Secondary fallback geolocation failed: ', err2);
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
  }
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
