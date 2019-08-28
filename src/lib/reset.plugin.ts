import { Injectable } from '@angular/core';
import { getActionTypeFromInstance, getValue, NgxsPlugin, setValue } from '@ngxs/store';
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
    return statesToKeep
      .map(meta => getPath(meta))
      .map(path => ({
        parts: path.split('.'),
        value: getValue(state, path),
      }))
      .reduce(
        (obj, { parts, value }) =>
          parts.reduceRight(
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
          ),
        {} as any,
      );
  }

  private overwriteStates(
    state: any,
    statesToOverwrite: MetaDataModel[],
    values: any[],
  ): any {
    statesToOverwrite.forEach(
      (meta, index) => (state = setValue(state, getPath(meta), values[index])),
    );
    return state;
  }

  private resetStates(state: any, statesToReset: MetaDataModel[]): any {
    statesToReset.forEach(meta => {
      state = setValue(
        state,
        getPath(meta),
        typeof meta.defaults === 'undefined' ? {} : meta.defaults,
      );

      if (meta.children) {
        state = this.resetStates(state, meta.children.map(
          getMetaData,
        ) as MetaDataModel[]);
      }
    });

    return state;
  }

  private resetStatesAll(state: any, statesToKeep: MetaDataModel[]): any {
    const values = statesToKeep.map(meta => getValue(state, getPath(meta)));

    return this.overwriteStates(this.resetService.initialState, statesToKeep, values);
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
        state = this.resetStatesAll(state, (action as StateResetAll).statesToKeep);
        break;

      case StateOverwrite.type:
        const { statesToOverwrite, values } = <StateOverwrite>action;
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
