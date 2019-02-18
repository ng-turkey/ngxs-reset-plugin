import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Actions, NgxsModule, Store } from '@ngxs/store';
import {
  NgxsResetPluginModule,
  StateClear,
  StateOverwrite,
  StateReset,
} from '../public_api';
import { AppState, PreferencesState, SessionState, ToDoState } from './test-states';
import { SessionEnd, ToDoAdd } from './test-symbols';

interface TestModel {
  actions$: Actions;
  store: Store;
}

describe('NgxsResetPlugin', () => {
  it('should clear states on StateClear', fakeAsync(() => {
    const { store } = setupTest();

    store.dispatch(new StateClear());
    tick();

    expect(store.snapshot()).toEqual({});
  }));

  it('should clear states on StateClear but keep selected', fakeAsync(() => {
    const { store } = setupTest();

    store.dispatch(new StateClear(PreferencesState));
    tick();

    expect(store.snapshot()).toEqual({
      app: { preferences: { darkmode: false, language: 'en' } },
    });
  }));

  it('should clear states on StateClear but keep selected (multi)', fakeAsync(() => {
    const { store } = setupTest();

    const lastseen = ensureLastSeen(store);

    store.dispatch(new StateClear(PreferencesState, SessionState));
    tick();

    expect(store.snapshot()).toEqual({
      app: { preferences: { darkmode: false, language: 'en' }, session: { lastseen } },
    });
  }));

  it('should log a warning on StateClear with wrong payload', fakeAsync(() => {
    const { store } = setupTest();
    const state = store.snapshot();

    console.warn = jasmine.createSpy('warning');

    store.dispatch(new StateClear(ToDoAdd));
    tick();

    expect(console.warn).toHaveBeenCalled();
    expect(store.snapshot()).toEqual({});
  }));

  it('should reset state to defaults on StateReset', fakeAsync(() => {
    const { store } = setupTest();

    store.dispatch(new StateReset(AppState)); // should respect state tree
    tick();

    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should reset state to defaults on StateReset (multi)', fakeAsync(() => {
    const { store } = setupTest();

    ensureLastSeen(store);

    store.dispatch(new StateReset(SessionState, ToDoState));
    tick();

    expect(store.selectSnapshot(SessionState)).toBeUndefined();
    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should log a warning on StateReset with wrong payload', fakeAsync(() => {
    const { store } = setupTest();
    const state = store.snapshot();

    console.warn = jasmine.createSpy('warning');

    store.dispatch(new StateReset(ToDoAdd));
    tick();

    expect(console.warn).toHaveBeenCalled();
    expect(store.snapshot()).toEqual(state);
  }));

  it('should overwrite state with given value on StateOverwrite', fakeAsync(() => {
    const { store } = setupTest();

    store.dispatch(new StateOverwrite([ToDoState, { list: [] }]));
    tick();

    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should overwrite state with given value on StateOverwrite (multi)', fakeAsync(() => {
    const { store } = setupTest();

    ensureLastSeen(store);

    store.dispatch(new StateOverwrite([SessionState, null], [ToDoState, { list: [] }]));
    tick();

    expect(store.selectSnapshot(SessionState)).toBeNull();
    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should log a warning on StateOverwrite with wrong payload', fakeAsync(() => {
    const { store } = setupTest();
    const state = store.snapshot();

    console.warn = jasmine.createSpy('warning');

    store.dispatch(new StateOverwrite([ToDoAdd, true]));
    tick();

    expect(console.warn).toHaveBeenCalled();
    expect(store.snapshot()).toEqual(state);
  }));
});

function ensureLastSeen(store: Store): number {
  const lastseen = new Date().valueOf();

  store.dispatch(new SessionEnd(lastseen));
  tick();

  expect(store.selectSnapshot(SessionState)).toEqual({ lastseen });

  return lastseen;
}

function setupTest(): TestModel {
  TestBed.configureTestingModule({
    imports: [
      NgxsModule.forRoot([AppState, PreferencesState, SessionState, ToDoState]),
      NgxsResetPluginModule.forRoot(),
    ],
  });

  const actions$ = TestBed.get(Actions);
  const store = TestBed.get(Store);

  store.dispatch(new ToDoAdd('Test'));

  tick();
  expect(store.selectSnapshot(ToDoState.list)).toEqual([
    { description: 'Test', done: false },
  ]);

  return { actions$, store };
}
