import { MetaDataModel } from '@ngxs/store/src/internal/internals';

export { MetaDataModel };

/**
 * a simplified implementation of NGXS StateClass interface
 */
export interface StateClass<T = {}> {
  NGXS_META?: MetaDataModel;

  new (...args: any[]): T;
}

export function noop() {
  return function() {};
}
