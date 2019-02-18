# NGXS Reset Plugin

This plugin is designed to clear, reset, and overwrite NGXS states on dispatch of predefined actions. If you wonder why you would need a plugin like this, when there is already a reset method in NGXS, you may find the [reasons(#reasons-to-use-this-plugin) below. Otherwise, skip to the [installation](#installation) or [usage](#usage) section.

## Reasons to Use This Plugin

Calling the reset method of NGXS Store like `store.reset(myNewStateObject)` can:

- replace a state with a new one.
- do it silently (triggering nothing), which is useful for tests.

Drawbacks/missing features of the reset method of NGXS Store are:

- the developer needs to select states or state snapshots and build a new state tree up of them. This is both difficult and painful multi-level states are in place. It becomes even more difficult when multiple state slices are required to be kept. Imagine shared parent states and merging several state slices based on path meta data.
- there is no method proposed to reset a state to its already defined defaults. That is an even more crucial requirement due to the simple fact that it is more frequently needed and replacing a state with anything other than defaults can potentially break your app.
- the execution is untrackable. Tracking it with [Redux DevTools plugin](https://npmjs.com/package/@ngxs/devtools-plugin) or the [Logger plugin](https://npmjs.com/package/@ngxs/logger-plugin) or acting upon it declaratively (such as a handler) is impossible.
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

## Roadmap

- [ ] Clear NGXS state(s) on dispatch of StateClear action

- [ ] Reset NGXS state(s) to defaults on dispatch of StateReset action

- [ ] Overwrite NGXS state(s) on dispatch of StateOverwrite action

- [ ] Test coverage

- [ ] Documentation & examples

- [x] Permissive license

- [x] Inclusive code of conduct

- [ ] Issue submission templates

- [ ] Contribution guidelines

- [ ] GitHub Pages implementation

- [ ] CI integrations
