import { Injectable } from '@angular/core';
import { NgxsPlugin } from '@ngxs/store';
import { NgxsNextPluginFn } from './internals';

@Injectable()
export class NgxsResetPlugin implements NgxsPlugin {
  handle(state: any, action: any, next: NgxsNextPluginFn) {
    return next(state, action);
  }
}
