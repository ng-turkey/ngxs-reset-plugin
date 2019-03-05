import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';
import { NgxsResetPlugin } from './reset.plugin';
import { ResetService } from './reset.service';
import { ResetHandler } from './reset.handler';
import { noop } from './internals';

@NgModule()
export class NgxsResetPluginModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxsResetPluginModule,
      providers: [
        ResetService,
        ResetHandler,
        {
          provide: APP_INITIALIZER,
          useFactory: noop,
          deps: [ResetHandler],
          multi: true,
        },
        {
          provide: NGXS_PLUGINS,
          useClass: NgxsResetPlugin,
          multi: true,
        },
      ],
    };
  }
}
