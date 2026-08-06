export interface PersistenceRecord<TValue = unknown> {
  key: string;
  value: TValue;
  updatedAt: string;
}

export interface PlatformPersistence {
  initialize(): Promise<void>;
  read<TValue>(key: string): Promise<TValue | null>;
  write<TValue>(key: string, value: TValue): Promise<PersistenceRecord<TValue>>;
  remove(key: string): Promise<void>;
}
