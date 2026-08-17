import { useState, useEffect, useCallback } from 'react';
import { fetchMemorialSites, fetchMemorialSiteById } from '../../app/services/memorialSiteService';
import type { MemorialSite, MemorialSiteSearchResult } from '../../app/services/memorialSiteService';

export interface MemorialSiteQuery {
  q?: string;
  category?: string;
  classification?: string;
  status?: string;
  page: number;
  pageSize: number;
}

export function useMemorialSites(params: MemorialSiteQuery) {
  const { q, category, classification, status, page, pageSize } = params;
  const [data, setData] = useState<MemorialSiteSearchResult>({ data: [], page, pageSize, totalRecords: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchMemorialSites(q, category, classification, status, page, pageSize);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [q, category, classification, status, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useMemorialSite(id: string) {
  const [data, setData] = useState<MemorialSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const item = await fetchMemorialSiteById(id);
      setData(item);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}