import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import {
  Admin,
  AdminSetSuperadmin,
  App,
  Preferences,
  PreferencesToggleDark,
  Session,
  SessionEnd,
  ToDo,
  ToDoAdd,
} from './test-symbols';

/**
 * Test AdminState
 */
@State<Admin.State>({
  name: 'admin',
  defaults: {
    role: 'admin',
  },
})
@Injectable()
export class AdminState {
  @Selector()
  static getState(state: Admin.State) {
    return state;
  }
  @Selector()
  static role({ role }: Admin.State): string {
    return role;
  }

  @Action(AdminSetSuperadmin)
  setSuperadmin({ patchState }: StateContext<Admin.State>) {
    patchState({
      role: 'superadmin',
    });
  }
}

/**
 * Test ToDoState
 */
@State<ToDo.State>({
  name: 'todos',
  defaults: {
    list: [],
  },
})
@Injectable()
export class ToDoState {
  @Selector()
  static getState(state: ToDo.State) {
    return state;
  }
  @Selector()
  static list({ list }: ToDo.State): ToDo.Item[] {
    return list;
  }

  @Action(ToDoAdd)
  addNewTodo(
    { getState, setState }: StateContext<ToDo.State>,
    { payload }: ToDoAdd,
  ) {
    const state = getState();
    setState({
      list: [
        ...state.list,
        {
          description: payload,
          done: false,
        },
      ],
    });
  }
}

/**
 * Test PreferencesState
 */
@State<Preferences.State>({
  name: 'preferences',
  defaults: {
    darkmode: false,
    language: 'en',
  },
})
@Injectable()
export class PreferencesState {
  @Selector()
  static getState(state: Preferences.State) {
    return state;
  }
  @Action(PreferencesToggleDark)
  toggleDark({ getState, patchState }: StateContext<Preferences.State>) {
    patchState({
      darkmode: !getState().darkmode,
    });
  }
}

/**
 * Test SessionState
 */
@State<Session.State>({
  name: 'session',
  defaults: {},
})
@Injectable()
export class SessionState {
  @Selector()
  static getState(state: Session.State) {
    return state;
  }
  @Action(SessionEnd)
  updateLastSeen(
    { patchState }: StateContext<Session.State>,
    { payload }: SessionEnd,
  ) {
    patchState({
      lastseen: payload,
    });
  }
}

/**
 * Test MissingState
 */
@State<number>({
  name: 'missing',
  defaults: Math.PI,
})
@Injectable()
export class MissingState {}

/**
 * Test AppState
 */
@State<App.State>({
  name: 'app',
  defaults: {
    status: 'ONLINE',
  },
  children: [PreferencesState, SessionState, ToDoState],
})
@Injectable()
export class AppState {}
