# NGXS Reset Plugin

<p align="center">
  <a href="https://travis-ci.org/ng-turkey/ngxs-reset-plugin"><img src="https://travis-ci.org/ng-turkey/ngxs-reset-plugin.svg?branch=master"/></a>
  <a href="https://codeclimate.com/github/ng-turkey/ngxs-reset-plugin/maintainability"><img src="https://api.codeclimate.com/v1/badges/94f61495acc71b81033a/maintainability" /></a>
  <a href="https://codecov.io/gh/ng-turkey/ngxs-reset-plugin"><img src="https://codecov.io/gh/ng-turkey/ngxs-reset-plugin/branch/master/graph/badge.svg" /></a>
  <img src="https://img.shields.io/github/license/ng-turkey/ngxs-reset-plugin.svg" />
  <a href="https://twitter.com/ngTurkiye"><img src="https://img.shields.io/twitter/follow/ngTurkiye.svg?label=Follow"/></a>
</p>

This plugin is designed to clear, reset, and overwrite [NGXS](https://www.npmjs.com/package/@ngxs/store) states on dispatch of predefined actions. Please check [this playground](https://stackblitz.com/edit/ngxs-pizza?file=src%2Fapp%2Forder%2Forder.handler.ts) for a working example.

If you wonder why you would need a plugin like this, when there is already a reset method in NGXS, you may find the [reasons](#reasons-to-use-this-plugin) below. Otherwise, skip to the [installation](#installation) or [usage](#usage) section.

**Notice:** For Ivy or Angular **v9+** use **[v1.3.x](https://github.com/ng-turkey/ngxs-reset-plugin/releases/tag/v1.3.1)**

## Reasons to Use This Plugin

Calling the reset method of NGXS Store like `store.reset(myNewStateObject)` can:

- replace a state with a new one.
- do it silently (triggering nothing), which is useful for tests.

Drawbacks/missing features of the reset method of NGXS Store are:

- the developer needs to select states or state snapshots and build a new state tree up of them. This is both difficult and painful multi-level states are in place. It becomes even more difficult when multiple state slices are required to be kept. Imagine shared parent states and merging several state slices based on path meta data.
- there is no method proposed to reset a state to its already defined defaults. That is an even more crucial requirement due to the simple fact that it is more frequently needed and replacing a state with anything other than defaults can potentially break your app.
- the execution is untrackable. Tracking it with [Redux DevTools plugin](https://www.npmjs.com/package/@ngxs/devtools-plugin) or the [Logger plugin](https://www.npmjs.com/package/@ngxs/logger-plugin) or acting upon it declaratively (such as a handler) is impossible.
- it "can cause unintended side effects if improperly used and should be used with caution!" (quoted from NGXS official documentation)

Reset plugin improves all these because it:

- provides a **clear and easy to implement API** (simple action dispatch).
- **resolves multi-level state structures** and keeps intended states while removing others.
- **eliminates the complexity of resetting a state tree** by recursively resetting child states.
- **finds and sets defaults of state classes** without any boilerplate or additional work.
- **supports every tracking method any other action dispatch does**, including but not limited to Redux DevTools, Logger plugin, and Actions stream by following the CQRS pattern.

How the concept of meta reducers related to all this is:

- every issue above can be solved using them. However, that literally means writing your own plugin.
- this plugin IS basically a meta reducer, but a robust and carefully tested one.

## Installation

Run the following code in your terminal:

```
yarn add ngxs-reset-plugin
```

or if you are using npm:

```
npm install ngxs-reset-plugin
```

## Usage

### Setup Before Initial Use

Import `NgxsResetPluginModule` into your root module like:

```TS
import { NgxsModule } from '@ngxs/store';
import { NgxsResetPluginModule } from 'ngxs-reset-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([ /* Your states here */ ]),
    NgxsResetPluginModule.forRoot()
  ]
})
export class AppModule {}
```

### How to Clear States

To clear all states (on logout for example):

```TS
this.store.dispatch(
  new StateClear()
);
```

To clear all states but one: \*

```TS
this.store.dispatch(
  new StateClear(SomeState)
);
```

To clear all states but some: \*

```TS
this.store.dispatch(
  new StateClear(SomeState, SomeOtherState)
);
```

\* Keeping states while deleting others is useful especially combined with [`@ngxs/storage-plugin`](https://npmjs.com/package/@ngxs/storage-plugin)

### How to Reset States to Defaults

To reset a single state to its defaults on certain events (such as route change):

```TS
this.store.dispatch(
  new StateReset(SomeState)
);
```

To reset multiple states to their defaults (may prove useful in distributed scenarios):

```TS
this.store.dispatch(
  new StateReset(SomeState, SomeOtherState)
);
```

### How to Reset All States to Defaults

To reset all states to their defaults:

```TS
this.store.dispatch(
  new StateResetAll()
);
```

To reset all states to their defaults but keep one:

```TS
this.store.dispatch(
  new StateResetAll(SomeState)
);
```

To reset all states to their defaults but keep some:

```TS
this.store.dispatch(
  new StateResetAll(SomeState, SomeOtherState)
);
```

> **Important Note:** Since it does not know anything about the actual states, `StateResetAll` resets the states based on `InitState` action dispatched by NGXS at init. If you are persisting states with @ngxs/storage-plugin and want them to get reset as well, you need to reset those persisted states with `StateReset` instead. Otherwise, next time the app starts, the storage plugin will put them in the store before `InitState` and `StateResetAll` will reset to initial states from storage and not to the original defaults of those states.

### How to Overwrite States

To replace the value of a single state with a new one: \*

```TS
// type OverwriteTuple = [StateClass, any];

this.store.dispatch(
  new StateOverwrite([SomeState, newStateValue])
);
```

To replace the value of multiple states with new ones: \*

```TS
// type OverwriteTuple = [StateClass, any];

this.store.dispatch(
  new StateOverwrite([SomeState, newStateValue], [SomeOtherState, newOtherStateValue])
);
```

\* Overwriting states with improper values can break your application. Proceed with caution.

## Roadmap

- [x] Clear NGXS state(s) on dispatch of StateClear action

- [x] Reset some NGXS state(s) to defaults on dispatch of StateReset action

- [x] Reset all NGXS states to defaults to on dispatch of StateResetAll action

- [x] Overwrite NGXS state(s) on dispatch of StateOverwrite action

- [x] Test coverage

- [x] Documentation & examples

- [x] Permissive license

- [x] Inclusive code of conduct

- [x] Issue submission templates

- [x] Contribution guidelines

- [x] CI integrations
