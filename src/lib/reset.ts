import {
  ENVIRONMENT_INITIALIZER,
  makeEnvironmentProviders,
} from '@angular/core';
import { withNgxsPlugin } from '@ngxs/store';
import { noop } from './internals';
import { ResetHandler } from './reset.handler';
import { NgxsResetPlugin } from './reset.plugin';
import { ResetService } from './reset.service';

export function withNgxsResetPlugin() {
  return makeEnvironmentProviders([
    withNgxsPlugin(NgxsResetPlugin),
    ResetService,
    ResetHandler,
    {
      provide: ENVIRONMENT_INITIALIZER,
      useFactory: noop,
      deps: [ResetHandler],
      multi: true,
    },
  ]);
}
