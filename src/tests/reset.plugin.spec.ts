import { NgZone } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Actions, NgxsModule, Store } from '@ngxs/store';
import {
  NgxsResetPluginModule,
  StateClear,
  StateOverwrite,
  StateReset,
  StateResetAll,
} from '../public_api';
import { AdminModule } from './test-lazy-module';
import {
  AdminState,
  AppState,
  PreferencesState,
  SessionState,
  ToDoState,
} from './test-states';
import {
  AdminSetSuperadmin,
  Preferences,
  PreferencesToggleDark,
  Session,
  SessionEnd,
  ToDoAdd,
} from './test-symbols';

interface TestModel {
  actions$: Actions;
  store: Store;
  navigateToAdmin: () => void;
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

    const session = ensureLastSeen(store);

    store.dispatch(new StateClear(PreferencesState, SessionState));
    tick();

    expect(store.snapshot()).toEqual({
      app: { preferences: { darkmode: false, language: 'en' }, session },
    });
  }));

  it('should log a warning on StateClear with wrong payload', fakeAsync(() => {
    const { store } = setupTest();

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

    expect(store.selectSnapshot(SessionState)).toEqual({});
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

  it('should reset state to defaults on StateResetAll', fakeAsync(() => {
    const { store } = setupTest();

    const preferences = store.selectSnapshot(PreferencesState);
    const session = store.selectSnapshot(SessionState);

    ensureDarkMode(store);
    ensureLastSeen(store);

    store.dispatch(new StateResetAll());
    tick();

    expect(store.selectSnapshot(PreferencesState)).toEqual(preferences);
    expect(store.selectSnapshot(SessionState)).toEqual(session);
    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should reset state to defaults on StateResetAll but keep given state', fakeAsync(() => {
    const { store } = setupTest();

    const session = ensureLastSeen(store);

    store.dispatch(new StateResetAll(SessionState));
    tick();

    expect(store.selectSnapshot(SessionState)).toEqual(session);
    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should reset state to defaults on StateResetAll but keep given states (multi)', fakeAsync(() => {
    const { store } = setupTest();

    const preferences = ensureDarkMode(store);
    const session = ensureLastSeen(store);

    store.dispatch(new StateResetAll(PreferencesState, SessionState));
    tick();

    expect(store.selectSnapshot(PreferencesState)).toEqual(preferences);
    expect(store.selectSnapshot(SessionState)).toEqual(session);
    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
  }));

  it('should log a warning on StateResetAll with wrong payload', fakeAsync(() => {
    const { store } = setupTest();
    const preferences = store.selectSnapshot(PreferencesState);
    const session = store.selectSnapshot(SessionState);

    console.warn = jasmine.createSpy('warning');

    ensureDarkMode(store);
    ensureLastSeen(store);

    store.dispatch(new StateResetAll(ToDoAdd));
    tick();

    expect(console.warn).toHaveBeenCalled();
    expect(store.selectSnapshot(PreferencesState)).toEqual(preferences);
    expect(store.selectSnapshot(SessionState)).toEqual(session);
    expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
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

    store.dispatch(
      new StateOverwrite([SessionState, null], [ToDoState, { list: [] }]),
    );
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

  describe('with lazy module', () => {
    let testModule: TestModel;

    beforeEach(fakeAsync(() => {
      testModule = setupTest();
      testModule.navigateToAdmin();
    }));

    it('should reset state to defaults on StateResetAll', fakeAsync(() => {
      const { store } = testModule;

      const adminState = store.selectSnapshot(AdminState);
      ensureSuperadminRole(store);

      store.dispatch(new StateResetAll());
      tick();

      expect(store.selectSnapshot(AdminState)).toEqual(adminState);
    }));

    it('should reset state to defaults on StateResetAll but keep given state', fakeAsync(() => {
      const { store } = testModule;

      const adminState = ensureSuperadminRole(store);

      store.dispatch(new StateResetAll(AdminState));
      tick();

      expect(store.selectSnapshot(AdminState)).toEqual(adminState);
      expect(store.selectSnapshot(ToDoState.list)).toEqual([]);
    }));
  });
});

function ensureDarkMode(store: Store): Preferences.State {
  const { darkmode } = store.selectSnapshot(PreferencesState);

  store.dispatch(new PreferencesToggleDark());
  tick();

  const preferences = store.selectSnapshot(PreferencesState);
  expect(preferences.darkmode).toBe(!darkmode);

  return preferences;
}

function ensureLastSeen(store: Store): Session.State {
  const lastseen = new Date().valueOf();

  store.dispatch(new SessionEnd(lastseen));
  tick();

  const session = store.selectSnapshot(SessionState);
  expect(session).toEqual({ lastseen });

  return session;
}

function ensureSuperadminRole(store: Store): Session.State {
  const role = store.selectSnapshot(AdminState.role);

  store.dispatch(new AdminSetSuperadmin());
  tick();

  const adminState = store.selectSnapshot(AdminState);
  expect(adminState.role).not.toBe(role);

  return adminState;
}

function setupTest(): TestModel {
  TestBed.configureTestingModule({
    imports: [
      NgxsModule.forRoot([AppState, PreferencesState, SessionState, ToDoState]),
      NgxsResetPluginModule.forRoot(),
      RouterTestingModule.withRoutes([
        {
          path: 'admin',
          loadChildren: () => AdminModule,
        },
      ]),
    ],
  });

  const router = TestBed.inject(Router);
  const ngZone = TestBed.inject(NgZone);
  const actions$ = TestBed.inject(Actions);
  const store = TestBed.inject(Store);

  function navigateToAdmin() {
    ngZone.run(() => {
      router.navigateByUrl('/admin');
    });
    tick();
  }

  store.dispatch(new ToDoAdd('Test'));

  tick();
  expect(store.selectSnapshot(ToDoState.list)).toEqual([
    { description: 'Test', done: false },
  ]);

  return { actions$, store, navigateToAdmin };
}
