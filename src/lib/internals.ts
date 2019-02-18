import { MetaDataModel } from '@ngxs/store/src/internal/internals';

export { MetaDataModel };

/**
 * from @ngxs/store/src/utils/utils
 */
export const setValue = (obj: any, prop: string, val: any) => {
  obj = { ...obj };

  const split = prop.split('.');
  const lastIndex = split.length - 1;

  split.reduce((acc, part, index) => {
    if (index === lastIndex) {
      acc[part] = val;
    } else {
      acc[part] = Array.isArray(acc[part]) ? [...acc[part]] : { ...acc[part] };
    }

    return acc && acc[part];
  }, obj);

  return obj;
};

/**
 * from @ngxs/store/src/utils/utils
 */
export const getValue = (obj: any, prop: string): any =>
  prop.split('.').reduce((acc: any, part: string) => acc && acc[part], obj);

/**
 * a simplified implementation of NGXS StateClass interface
 */
export interface StateClass<T = {}> {
  NGXS_META?: MetaDataModel;

  new (...args: any[]): T;
}
