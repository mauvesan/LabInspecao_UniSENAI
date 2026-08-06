const DEFAULT_NAMESPACE = 'labinspecao_platform_v1';

export class LocalPlatformPersistence {
  constructor({ storage = globalThis.localStorage, namespace = DEFAULT_NAMESPACE } = {}) {
    this.storage = storage;
    this.namespace = namespace;
    this.initialized = false;
  }

  async initialize() {
    if (!this.storage) {
      throw new Error('Armazenamento local indisponível.');
    }

    this.initialized = true;
  }

  async read(key) {
    this.assertInitialized();
    const rawValue = this.storage.getItem(this.createStorageKey(key));

    if (rawValue === null) {
      return null;
    }

    try {
      const record = JSON.parse(rawValue);
      return record.value ?? null;
    } catch {
      return null;
    }
  }

  async write(key, value) {
    this.assertInitialized();

    const record = {
      key,
      value,
      updatedAt: new Date().toISOString(),
    };

    this.storage.setItem(this.createStorageKey(key), JSON.stringify(record));

    return record;
  }

  async remove(key) {
    this.assertInitialized();
    this.storage.removeItem(this.createStorageKey(key));
  }

  createStorageKey(key) {
    if (!key || typeof key !== 'string') {
      throw new TypeError('A chave de persistência deve ser uma string não vazia.');
    }

    return `${this.namespace}:${key}`;
  }

  assertInitialized() {
    if (!this.initialized) {
      throw new Error('A persistência da plataforma ainda não foi inicializada.');
    }
  }
}
