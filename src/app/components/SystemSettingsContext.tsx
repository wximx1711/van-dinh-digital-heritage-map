import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiGet } from '../services/api';

export interface SystemSettings {
  websiteName: string;
  logoUrl: string;
  footerText: string;
  contactEmail: string;
  phone: string;
  address: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  homeBackgroundType: string;
  homeBackgroundImageUrl: string;
  homeBackgroundVideoUrl: string;
  homeBackgroundVideoPosterUrl: string;
  updatedAt: string;
}

interface SystemSettingsContextType {
  settings: SystemSettings | null;
  refreshSettings: () => void;
  updateSettings: (s: Partial<SystemSettings>) => void;
}

const defaultSettings: SystemSettings = {
  websiteName: '',
  logoUrl: '',
  footerText: '',
  contactEmail: '',
  phone: '',
  address: '',
  facebookUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  homeBackgroundType: '',
  homeBackgroundImageUrl: '',
  homeBackgroundVideoUrl: '',
  homeBackgroundVideoPosterUrl: '',
  updatedAt: '',
};

const SystemSettingsContext = createContext<SystemSettingsContextType>({
  settings: null,
  refreshSettings: () => {},
  updateSettings: () => {},
});

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const mountedRef = useRef(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await apiGet<any>('/system-settings');
      if (!mountedRef.current) return;
      setSettings({
        websiteName: data.websiteName || '',
        logoUrl: data.logoUrl || '',
        footerText: data.footerText || '',
        contactEmail: data.contactEmail || '',
        phone: data.phone || '',
        address: data.address || '',
        facebookUrl: data.facebookUrl || '',
        tiktokUrl: data.tiktokUrl || '',
        youtubeUrl: data.youtubeUrl || '',
        homeBackgroundType: data.homeBackgroundType || '',
        homeBackgroundImageUrl: data.homeBackgroundImageUrl || '',
        homeBackgroundVideoUrl: data.homeBackgroundVideoUrl || '',
        homeBackgroundVideoPosterUrl: data.homeBackgroundVideoPosterUrl || '',
        updatedAt: data.updatedAt || '',
      });
    } catch {
      // silently fall back to defaults
    }
  }, []);

  const updateSettings = useCallback((s: Partial<SystemSettings>) => {
    setSettings(prev => prev ? { ...prev, ...s } : { ...defaultSettings, ...s });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSettings();
    return () => { mountedRef.current = false; };
  }, [fetchSettings]);

  return (
    <SystemSettingsContext.Provider value={{ settings: settings ?? defaultSettings, refreshSettings: fetchSettings, updateSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  return useContext(SystemSettingsContext);
}
