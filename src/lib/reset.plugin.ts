import { Injectable } from '@angular/core';
import { getActionTypeFromInstance, NgxsPlugin } from '@ngxs/store';
import { getValue, MetaDataModel, setValue } from './internals';
import { StateClear, StateReset, StateOverwrite, getMetaData } from './symbols';

@Injectable()
export class NgxsResetPlugin implements NgxsPlugin {
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

  handle(state: any, action: any, next: any) {
    const type: string = getActionTypeFromInstance(action) || '';

    switch (type) {
      case StateClear.type:
        const { statesToKeep } = <StateClear>action;
        state = this.clearStates(state, statesToKeep);
        break;

      case StateReset.type:
        const { statesToReset } = <StateReset>action;
        state = this.resetStates(state, statesToReset);
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
  return meta.path || '';
}
