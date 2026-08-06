import AsyncStorage from "@react-native-async-storage/async-storage";

class AppStorage {
  private cache: Map<string, string> = new Map();
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.length > 0) {
          const pairs = await AsyncStorage.multiGet(keys);
          for (const [key, value] of pairs) {
            if (value !== null) {
              this.cache.set(key, value);
            }
          }
        }
      } catch (e) {
        console.warn("Storage init warning:", e);
      } finally {
        this.initialized = true;
      }
    })();

    return this.initPromise;
  }

  public getItem(key: string): string | null {
    return this.cache.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.cache.set(key, value);
    AsyncStorage.setItem(key, value).catch((err) =>
      console.warn(`Failed to set storage key ${key}:`, err)
    );
  }

  public removeItem(key: string): void {
    this.cache.delete(key);
    AsyncStorage.removeItem(key).catch((err) =>
      console.warn(`Failed to remove storage key ${key}:`, err)
    );
  }

  public async getItemAsync(key: string): Promise<string | null> {
    await this.init();
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) {
        this.cache.set(key, val);
      }
      return val;
    } catch (e) {
      return this.cache.get(key) ?? null;
    }
  }

  public async setItemAsync(key: string, value: string): Promise<void> {
    this.cache.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Failed to set storage key ${key}:`, e);
    }
  }
}

export const appStorage = new AppStorage();
