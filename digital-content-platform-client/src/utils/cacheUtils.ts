interface CacheItem<T> {
  value: T;
  expiry: number;
}

export class ClientCache {
  private static instance: ClientCache;
  private cache: Map<string, CacheItem<any>> = new Map();

  private constructor() {}

  public static getInstance(): ClientCache {
    if (!ClientCache.instance) {
      ClientCache.instance = new ClientCache();
    }
    return ClientCache.instance;
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    // Если элемент не найден или срок его действия истек
    if (!item || Date.now() > item.expiry) {
      if (item) {
        this.cache.delete(key);
      }
      return null;
    }
    
    return item.value;
  }

  public set<T>(key: string, value: T, ttlMinutes: number = 5): void {
    const expiry = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, { value, expiry });
  }

  public remove(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public clearByPrefix(prefix: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

export const clientCache = ClientCache.getInstance();