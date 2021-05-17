import { Injectable } from '@angular/core';
import {
  getActionTypeFromInstance,
  getValue,
  NgxsPlugin,
  setValue,
} from '@ngxs/store';
import { MetaDataModel } from './internals';
import { ResetService } from './reset.service';
import {
  getMetaData,
  StateClear,
  StateOverwrite,
  StateReset,
  StateResetAll,
} from './symbols';

@Injectable()
export class NgxsResetPlugin implements NgxsPlugin {
  constructor(private readonly resetService: ResetService) {}

  private clearStates(state: any, statesToKeep: MetaDataModel[]): any {
    return statesToKeep.reduce((obj, meta) => {
      const path = getPath(meta);
      if (!path) {
        return obj;
      }

      const parts = path.split('.');
      const value = getValue(state, path);

      return parts.reduceRight(
        (acc, part) =>
          part in obj
            ? {
                [part]: {
                  ...obj[part],
                  ...acc,
                },
              }
            : { [part]: acc },
        value,
      );
    }, {});
  }

  private overwriteStates(
    state: any,
    statesToOverwrite: MetaDataModel[],
    values: any[],
  ): any {
    statesToOverwrite.forEach((meta, index) => {
      const path = getPath(meta);
      if (!path) {
        return;
      }

      state = setValue(state, path, values[index]);
    });
    return state;
  }

  private resetStates(state: any, statesToReset: MetaDataModel[]): any {
    statesToReset.forEach((meta) => {
      const path = getPath(meta);
      if (!path) {
        return;
      }

      state = setValue(
        state,
        path,
        typeof meta.defaults === 'undefined' ? {} : meta.defaults,
      );

      if (meta.children) {
        state = this.resetStates(
          state,
          meta.children.map(getMetaData) as MetaDataModel[],
        );
      }
    });

    return state;
  }

  private resetStatesAll(state: any, statesToKeep: MetaDataModel[]): any {
    const [metas, values] = statesToKeep.reduce(
      (acc: [MetaDataModel[], any[]], meta) => {
        const path = getPath(meta);
        if (!path) {
          return acc;
        }

        acc[0].push(meta);
        acc[1].push(getValue(state, path));
        return acc;
      },
      [[], []],
    );

    return this.overwriteStates(this.resetService.initialState, metas, values);
  }

  handle(state: any, action: any, next: any) {
    const type = getActionTypeFromInstance(action);

    switch (type) {
      case StateClear.type:
        state = this.clearStates(state, (action as StateClear).statesToKeep);
        break;

      case StateReset.type:
        state = this.resetStates(state, (action as StateReset).statesToReset);
        break;

      case StateResetAll.type:
        state = this.resetStatesAll(
          state,
          (action as StateResetAll).statesToKeep,
        );
        break;

      case StateOverwrite.type:
        const { statesToOverwrite, values } = action as StateOverwrite;
        state = this.overwriteStates(state, statesToOverwrite, values);
        break;

      default:
        break;
    }

    return next(state, action);
  }
}

function getPath(meta: MetaDataModel): string {
  return meta.path;
}
