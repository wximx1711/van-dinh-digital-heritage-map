import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiGet, apiPut } from '../services/api';
import { getImageUrl } from '../utils/url';

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
}

interface SystemSettingsContextType {
  settings: SystemSettings | null;
  refreshSettings: () => void;
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
};

const SystemSettingsContext = createContext<SystemSettingsContextType>({
  settings: null,
  refreshSettings: () => {},
});

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await apiGet<SystemSettings>('/system-settings');
      let logoUrl = data.logoUrl || '';
      if (logoUrl) {
        try {
          const fullUrl = getImageUrl(logoUrl);
          const headResp = await fetch(fullUrl, { method: 'HEAD' });
          if (!headResp.ok) {
            logoUrl = '';
            await apiPut('/system-settings', { ...data, logoUrl: '' }).catch(() => {});
          }
        } catch {
          logoUrl = '';
        }
      }
      setSettings({
        websiteName: data.websiteName || '',
        logoUrl,
        footerText: data.footerText || '',
        contactEmail: data.contactEmail || '',
        phone: data.phone || '',
        address: data.address || '',
        facebookUrl: data.facebookUrl || '',
        tiktokUrl: data.tiktokUrl || '',
        youtubeUrl: data.youtubeUrl || '',
      });
    } catch {
      // silently fall back to defaults
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SystemSettingsContext.Provider value={{ settings: settings ?? defaultSettings, refreshSettings: fetchSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  return useContext(SystemSettingsContext);
}
