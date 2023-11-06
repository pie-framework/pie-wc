# PIE Web Components

[!WARNING]
This is a proof of concept to test out a new dev architecture that's based on Lit and Vite primarily. It's not 
ready for production use. In fact we'll likely create a fresh project once we're happy with the basic results
here.

## Why?

The current version of PIE is based on React and Webpack. While this has served us well, it's not quite aligned
with the stated design goals of PIE, in particular to use web components to the fullest extent (and as a result
of that, make it easy to use PIE in other frameworks). On top of that, the current webpack based build architecture
(see PIE CLI and the custom build server - PITS - we use at Renaissance) is complex and hence hard to maintain.
Finally, there are a few architecture improvements we can make to make PIE easier to use in all kinds of contexts,
even without having to use special build tools and replace some of the custom tools we built with alternatives
we don't have to maintain ourselves (like Storybook).

## Design Goals

- Use web components to the fullest extent possible. Lit (3.x) is a fantastic minimal framework that allows us to create
    web components that can be used in any framework (or at least most of them).
- Make the framework components better composable, so that it is easier to replace parts with custom implementations
    and make the whole easier to maintain. For instance, we can have a container component that handles common session
    handling and then e.g. a panel to display scores can be designed to run inside that container. That panel would 
    require minimal knowledge of the rest of PIE, which would make it easier to maintain and also easier to wrote
    custom versions of it. Another example of where we can do better in this respect is how e.g. controllers and
    components are linked, which is currently deep into the internals of the PIE tooling.
- Faster builds, smaller bundles, easier project and build management (using Vite).
- Typing (using TypeScript) everywhere so that code is more robust and easier to explore.
- Upgrade Material Design to the latest version (3.x). Material Design Web 3 is being worked on and is still at least
    several months out from being released, but it is likely to be a significant improvement over the current version
    (1.x) we use, particularly when it comes to accessibility.
- Better test support (via Storybook, possibly other tools).

## Use

Currently, the project uses [PNPM](https://pnpm.io/). We're considering [Turbo](https://turbo.build/) 
and [Bun](https://bun.sh/).

### Install dependencies

```sh
pnpm install
```

### Build

```sh
pnpn build
```

### Run Storybook

```sh
cd apps/workshop
pnpm storybook
```
