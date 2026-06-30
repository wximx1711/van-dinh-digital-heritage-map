// Custom hooks for fetching heritage data from API

import { useState, useEffect, useCallback } from 'react';
import { heritageSites, intangibleHeritage, monthlyUpdates } from '../../data/mockData';
import { typeLabels, classificationLabels, statusLabels } from '../../data/labels';

export function useHeritageSites() {
  const [data, setData] = useState<typeof heritageSites>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(heritageSites);
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
  const [data, setData] = useState<typeof intangibleHeritage>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(intangibleHeritage);
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
  const [data, setData] = useState<typeof heritageSites[0] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      const site = heritageSites.find(s => s.id === id) || heritageSites[0];
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

export function useMonthlyUpdates() {
  const [data, setData] = useState<typeof monthlyUpdates>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 50));
      setData(monthlyUpdates);
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

export function useTypeLabels() {
  return typeLabels;
}

export function useClassificationLabels() {
  return classificationLabels;
}

export function useStatusLabels() {
  return statusLabels;
}
