import { Injectable } from '@angular/core';
import { Actions, InitState, ofActionSuccessful, Store, UpdateState } from '@ngxs/store';
import { take } from 'rxjs/operators';
import { ResetService } from './reset.service';

@Injectable()
export class ResetHandler {
  constructor(
    private actions$: Actions,
    private store: Store,
    private resetService: ResetService,
  ) {
    this.actions$
      .pipe(
        ofActionSuccessful(InitState),
        take(1),
      )
      .subscribe(() => (this.resetService.initialState = this.store.snapshot()));

    this.actions$.pipe(ofActionSuccessful(UpdateState)).subscribe(
      ({ addedStates }) =>
        (this.resetService.initialState = {
          ...this.resetService.initialState,
          ...addedStates,
        }),
    );
  }
}
