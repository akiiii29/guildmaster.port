import type { SyncSnapshot } from './protocol'

const DATABASE_NAME = 'guild-master-sync'
const DATABASE_VERSION = 1
const SNAPSHOT_KEY = 'latest'
const DEVICE_KEY = 'device-id'
const REVISION_KEY = 'server-revision'
const ACCOUNT_KEY = 'queue-account'

interface StoredSnapshot {
  key: typeof SNAPSHOT_KEY
  queuedAt: number
  snapshot: SyncSnapshot
}

const memory = {
  snapshot: undefined as StoredSnapshot | undefined,
  deviceId: undefined as string | undefined,
  revision: 0,
  accountId: undefined as string | undefined,
}

function hasIndexedDb() {
  return typeof indexedDB !== 'undefined'
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onerror = () => reject(request.error ?? new Error('Unable to open the sync queue.'))
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('snapshots')) database.createObjectStore('snapshots')
      if (!database.objectStoreNames.contains('meta')) database.createObjectStore('meta')
    }
    request.onsuccess = () => resolve(request.result)
  })
}

async function read<T>(storeName: 'snapshots' | 'meta', key: string): Promise<T | undefined> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).get(key)
    request.onerror = () => reject(request.error ?? new Error('Unable to read the sync queue.'))
    request.onsuccess = () => resolve(request.result as T | undefined)
    transaction.oncomplete = () => database.close()
  })
}

async function write(storeName: 'snapshots' | 'meta', key: string, value: unknown): Promise<void> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put(value, key)
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to write the sync queue.'))
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
  })
}

async function remove(storeName: 'snapshots' | 'meta', key: string): Promise<void> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).delete(key)
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to update the sync queue.'))
    transaction.oncomplete = () => {
      database.close()
      resolve()
    }
  })
}

function createDeviceId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
      const value = Math.floor(Math.random() * 16)
      return (character === 'x' ? value : (value & 0x3) | 0x8).toString(16)
    })
}

export class SyncQueue {
  async ensureAccount(accountId: string) {
    if (!hasIndexedDb()) {
      if (memory.accountId !== accountId) {
        memory.accountId = accountId
        memory.revision = 0
        memory.snapshot = undefined
      }
      return
    }
    const activeAccount = await read<string>('meta', ACCOUNT_KEY)
    if (activeAccount === accountId) return
    await Promise.all([
      remove('snapshots', SNAPSHOT_KEY),
      write('meta', REVISION_KEY, 0),
      write('meta', ACCOUNT_KEY, accountId),
    ])
  }

  async getDeviceId() {
    if (!hasIndexedDb()) {
      memory.deviceId ??= createDeviceId()
      return memory.deviceId
    }
    const stored = await read<string>('meta', DEVICE_KEY)
    if (stored) return stored
    const deviceId = createDeviceId()
    await write('meta', DEVICE_KEY, deviceId)
    return deviceId
  }

  async getServerRevision() {
    if (!hasIndexedDb()) return memory.revision
    return (await read<number>('meta', REVISION_KEY)) ?? 0
  }

  async setServerRevision(revision: number) {
    if (!hasIndexedDb()) {
      memory.revision = revision
      return
    }
    await write('meta', REVISION_KEY, revision)
  }

  async enqueue(snapshot: SyncSnapshot) {
    const stored: StoredSnapshot = { key: SNAPSHOT_KEY, queuedAt: Date.now(), snapshot }
    if (!hasIndexedDb()) {
      memory.snapshot = stored
      return stored
    }
    await write('snapshots', SNAPSHOT_KEY, stored)
    return stored
  }

  async peek() {
    if (!hasIndexedDb()) return memory.snapshot
    return read<StoredSnapshot>('snapshots', SNAPSHOT_KEY)
  }

  async removeIfCurrent(queuedAt: number) {
    const current = await this.peek()
    if (!current || current.queuedAt !== queuedAt) return
    if (!hasIndexedDb()) {
      memory.snapshot = undefined
      return
    }
    await remove('snapshots', SNAPSHOT_KEY)
  }

  async clear() {
    if (!hasIndexedDb()) {
      memory.snapshot = undefined
      return
    }
    await remove('snapshots', SNAPSHOT_KEY)
  }
}
