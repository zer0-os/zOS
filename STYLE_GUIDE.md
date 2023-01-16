TODO:: Outstanding Topics:

- shared vs. core components
- Style management (BEM/CSS modules/etc.)
- Storybook

## Intro

This is a collection of choices/preferences/decisions around how to build within the Zero ecosystem. It is a collection of guidance intended to help keep things maintainable and provide some consistency across the project as well as related projects. It is also a repository of decisions that have been made including reasoning where appropriate, to reduce the need for repeat discussions.

## Components

The responsibility of components is to display data and accept user input. Business logic including data manipulation does not belong at the component level.

### Function vs. Class Components

Function and class components both have their place. Function components can be used for simple components that don't require a lot of logic around how the data is displayed. For anything that requires a bit more complexity, a class is generally going to be more appropriate.

#### Function Components

The general wisdom around functions in software development also applies to function components. They should be very short, accept minimal input props, and return clear and consistent markup. If you can't figure out what a function component requires, renders, and is doing at a glance, then it is too long.

- A function component should be no more than 15-20 lines excluding markup.
- The markup should be a single block, and should be restricted to the return statement.
- The markup should also have very minimal logic contained within it.

#### Class Components

The general wisdom around classes in software development also applies to class components.

### Hooks

Hooks are a useful tool when their strengths and limitations are understood. They provide a means to add some state and a bit of additional logic to a function component without having to convert it to a class or break out multiple components. For simple components this can result in something that is a bit more straightforward and easier to understand than using a class, and can increase development speed for small changes. As with function components, hooks should be short, accept minimal inputs, and should be "grokable" at a glance.

- Hooks should be a maximum of 15-20 lines.
- Hooks cannot be nested. eg. you cannot call a _custom_ hook from another hook. You can use built-in hooks within a custom hook.
- Hooks are not the place for business logic. As with code contained directly in a component, they should be limited to logic that is directly related to rendering data and responding to/routing user input.
- Hooks should not be used for interacting with external dependencies, including global state.

#### Background

Because they are the "latest thing", which always ends up generating a lot of religious fervor, the reasoning around the guidance on hooks is as follows:

1. Custom hooks are impractical and inefficient to test.
   1. Because they are intended to function within an opaque external environment, it is not possible to test them in isolation without a lot of custom setup. Since the environment is so opaque, this can result in brittle tests across a project.
      1. It is possible this could eventually be solved by tooling such as Enzyme, but at the moment the support does not appear to be there. Additionally, as the ecosystem changes and popularity shifts, the potential for those tools to suddenly cease to be maintained is high (see the current state of testing context in a class component). Limiting the amount of code that directly depends on stability at that level is prudent.
   2. Related to the above point, it is difficult to expose a clear interface from a hook. Since their purpose is to run within the external render environment, it can be difficult to find or define a good 'seam'. The "easy path" to adding dependencies in a hook is by adding and calling another hook, but as soon as you do that you are adding a dependency that is both not clearly defined in the interface, and is not testable on its own.
   3. Hooks are additionally not part of the external component interface which, when combined with the above points, make them impractical as a means of code reuse. Since hooks are not visible external to the component, it is not possible to isolate them in a test, or conversely to test the component in isolation from them. The result of this is that from an isolation standpoint, hooks are indistinguishable from the component they are used in. This has multiple consequences:
      1. Duplicate tests. Since you cannot isolate the hook from the component it is used in, you end up duplicating tests anywhere that hook is used.
      2. Since the consuming components will all be different (or they would be the same component), the hook logic with all associated permutations needs to be considered and accounted for independently in every place that it is used. This not only makes for brittle tests, but tests where failures are difficult to diagnose. It also means that tests will be missed, as the more times you try to think through every permutation, the higher the possibility that you will miss some.
      3. Since they are essentially "magic", in that they need to run in a specific context, hooks make it more difficult, and more error prone to do larger restructurings within an application. You cannot just shift the logic from a hook into a new context (eg. calling from a utility library) without fully rethinking and rewriting the entire way it is used.
      4. They are impractical for interacting with external dependencies, including global state, as any dependencies need to be mocked at the module level, which when combined with the fact that dependencies are not explicitly defined in the interface at the level you are testing, makes for both very complex and labor intensive setup, and very brittle tests.
   4. In response to the previous points, the obvious response to many of them is to try and test _everything_ at as high a level as possible. This is unfortunately not practical in a real application. While high level "as a user would interact with it" tests are an important part of the testing pyramid, they are at the top of the pyramid for a reason. They are slow, they are brittle, and they are too far removed from the actual implementation.
      1. A failing UI test is an important signal, and an important last line of defense, but it is not a practical way of diagnosing _what_ has gone wrong. Conversely, there is simply no way to be thorough enough with user level tests to give you full confidence in all aspects of the underlying code.
      2. User level tests are slooooow. Even fast ones are slow. Rapid feedback loops are an important part of building software, and there's just no way to integrate user-level tests with an efficient development workflow.
      3. User level tests don't actually address all of the previous points, and in fact, exacerbate some of them. Such as the overhead required to deal with deeply nested external dependencies. Handling them at a single level of abstraction is hard enough, but if they are deeply nested, they become so far removed from the current working context that any effort to discover and maintain them requires way more overhead than is practical.
2. Hooks require function components.
   1. Any functionality tied up in hooks needs to be fully restructured if the component is rewritten using a class. This alone makes it a poor choice for code reuse, since as soon as you convert to a class, you need to rewrite the the functionality from scratch.
   2. Because of the previous point, using hooks increases the friction in using all of the tools available, and puts a heavy emphasis on exclusively using function components. While in principle this could be a reasonable tradeoff if the benefits were large enough, in practice the discipline required to structure a complex application using only function components is much greater than if you are able to also use class components. Additionally, the benefits of using hooks in practice are only apparent if you are _already_ exclusively using function components. The result of this is that while they are a reasonable tool to use in moderation, or if you already have the discipline required to exclusively use function components, they are not in and of themselves a reasonable replacement for using class components where appropriate.

## Global State

We have chosen to use redux to manage global state, as it is pretty ubiquitous, stable, and remains highly active.
We use redux-saga instead of thunks, as they are much more appropriate for managing complex operations due to their ability to handle concurrency in multiple ways, and the fact that they are much easier to test.

### Business logic

While there are tradeoffs to depending heavily on global state, the benefits to a large application are numerous. Because of this, we choose to handle most business logic at the level of global state. Because of its ability to interact closely with global state, as well as its built-in ability to handle complex concurrency scenarios, we try to keep or trigger most business logic in sagas.
