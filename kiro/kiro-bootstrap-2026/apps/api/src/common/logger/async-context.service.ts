import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  traceId: string;
  userId?: string;
}

@Injectable()
export class AsyncContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run(store: RequestContext, callback: () => void): void {
    this.storage.run(store, callback);
  }

  getStore(): RequestContext | undefined {
    return this.storage.getStore();
  }

  getTraceId(): string | undefined {
    return this.storage.getStore()?.traceId;
  }

  getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  setUserId(id: string): void {
    const store = this.storage.getStore();
    if (store) {
      store.userId = id;
    }
  }
}
