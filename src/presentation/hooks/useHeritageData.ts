import { useState, useEffect, useCallback } from 'react';
import { fetchHeritageSites, fetchHeritageSite } from '../../app/services/heritageService';
import { fetchIntangibleHeritage } from '../../app/services/intangibleService';
import { typeLabels, classificationLabels, statusLabels } from '../../data/labels';
import type { HeritageSite, IntangibleHeritage } from '../../core/types';

export function useHeritageSites() {
  const [data, setData] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const sites = await fetchHeritageSites();
      setData(sites);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useIntangibleHeritage() {
  const [data, setData] = useState<IntangibleHeritage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const items = await fetchIntangibleHeritage();
      setData(items);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useHeritageSite(id: string) {
  const [data, setData] = useState<HeritageSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const site = await fetchHeritageSite(id);
      setData(site);
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

export function useTypeLabels() {
  return typeLabels;
}

export function useClassificationLabels() {
  return classificationLabels;
}

export function useStatusLabels() {
  return statusLabels;
}
