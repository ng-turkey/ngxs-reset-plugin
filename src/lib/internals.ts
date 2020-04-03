export interface MetaDataModel {
  name: string | null;
  defaults: any;
  path: string | null;
  children?: StateClass[];
}

/**
 * a simplified implementation of NGXS StateClass interface
 */
export interface StateClass<T = {}> {
  NGXS_META?: MetaDataModel;

  new (...args: any[]): T;
}

export function noop() {
  return () => {};
}
