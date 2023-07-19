# zOS

#### Flexible application platform for interacting with the Zer0 ecosystem

## Getting Started

1. clone the repo
1. run `npm install`
1. copy .env.example to .env and change/add the necessary values
1. run `npm start` to run the app or
1. `npm run test` to run the tests

## Ways to Participate

### Create an app

The [zOS Feed app](https://github.com/zer0-os/zOS-feed) is the first core app, and provides a template to follow. Get in touch with the zOS core team to discuss having your app integrated.

1. fork the zOS repo, as new apps still require some changes to the platform at this stage.
1. follow the getting started steps above and make sure you have a running zOS instance.
1. add a repo for your new app. you can copy the feed app to get the basics, or just start from scratch.
1. an app is just a component that conforms to the interface required by the platform. once you have the basics of your app in place, you can add it to the platform to make sure it loads correctly:
   1. add your package, and import in [src/app-sandbox/index.tsx](src/app-sandbox/index.tsx)
   1. add a conditional to the `renderSelectedApp` method that returns your component. if your app is covered by the default apps set, then use the corresponding member of the Apps enum.
   1. add your app to the allApps array in [src/lib/apps/index.ts](src/lib/apps/index.ts)
   1. make sure your app shows up in the menu, and that you can access it when the menu item is clicked.
   1. once you have a stable version of your app, you can create a PR to the core zOS repo with the platform changes, and the version of your app you would like released.

### Contribute to the Platform

There is always work to be done on the core platform, so if you've noticed a bug or want to get involved at a deeper level, feel free to open a PR, or get in touch with the core team. Be sure to check out the [contributing guidelines](CONTRIBUTING.md) and [style guide](STYLE_GUIDE.md) before opening a PR.

### Architecture

A high level overview of the Component, Connected Component, Redux Saga, Normalizr, Redux architecture: https://miro.com/app/board/uXjVPL_sxFI=/

### Styling Conventions and Structure

#### Overview

We are using SCSS as our CSS preprocessor because of the additional power it provides, such as variables, mixins, nesting and inheritance. We also utilize BEM (Block, Element, Modifier) methodology to structure our CSS class names to ensure that they are understandable, scalable and maintainable.

#### BEM (Block Element Modifier)

BEM stands for "Block", "Element", and "Modifier". It's a naming methodology that provides a way to create reusable components and code sharing in CSS.

Block represents the higher level of an abstraction or component.
Element is a part of the block that performs a certain function.
Modifier is a property of the block or an element used to change appearance or behavior.

Our BEM utility functions are defined in the `src/lib/bem.ts file`. This contains three exported functions: `bem`, `bemClassName`, and `fullBem`.

`bem` and `bemClassName` are high-level functions that allow you to generate BEM-compliant class names based on the block, element, and modifier that you provide. `fullBem` is a helper function used by `bem` and `bemClassName` to build the full BEM class name.

```
// src/lib/bem.ts
export function bem(block: string) {
  return (element, modifier = '') => fullBem(block, element, modifier);
}

export function bemClassName(block: string) {
  return (element = '', modifier = '') => {
    return { className: fullBem(block, element, modifier) };
  };
}

function fullBem(block: string, element = '', modifier = '') {
  let result = block;
  if (element) {
    result += `__${element}`;
  }
  if (modifier) {
    result += ` ${result}--${modifier}`;
  }

  return result;
}
```

#### Component and Styling Example

Block Class Naming: The primary class name for a component is derived from its filename. For example, a file named `create-wallet-account` has a primary class named `create-wallet-account`.

BEM Naming Conventions: The classes follow the naming convention of the BEM methodology. For instance, a parent block `.create-wallet-account` has elements like `__heading`, `__sub-heading`, etc. The naming convention makes it clear which elements belong to which block.

Nested Elements: The BEM convention enables developers to nest elements. This is evident in our `src/authentication/create-wallet-account/index.tsx` file where we've declared nested elements under the parent block `.create-wallet-account`. This helps maintain style encapsulation and makes the stylesheet easy to navigate.

```
const c = bem('create-wallet-account');

<div className={c('')}>
   <h3 className={c('heading')}>CREATE YOUR ACCOUNT</h3>
   <div className={c('sub-heading')}>Step 1 of 2: Select your wallet</div>
      <div className={c('main')}>
         <div className={c('select-wallet')}>
            ....
         </div>
         <div className={c('other-options')}>
            ....
         </div>
      </div>
   </div>
</div>
```

Another example of how these BEM utilities are used can be found in the `Message` component.

In the `Message` component file, `src/components/message/index.tsx`, we start by importing the `bemClassName` function and then use it to create a utility function, cn, for generating class names for this component.

```
// src/components/message/index.tsx
import { bemClassName } from '../../lib/bem';

const cn = bemClassName('message');
```

The `cn` function is then used throughout the component to assign BEM-compliant class names to HTML elements.

For instance, the following piece of code sets the class name for a `div` block. The block is `'message'`, the element is `'block'`, and the modifier is dynamic, depending on whether the `isFullWidth` state is `true`.

```
// src/components/message/index.tsx
<div {...cn('block', this.state.isFullWidth && 'fill')}>
```

The styles for these classes are defined in a corresponding SCSS file, `src/components/message/styles.scss`.

The SCSS file uses the SCSS `@use` rule to import variables from a theme file. It then defines the styles for each BEM class. For example, the styles for the `'message__block'` class are defined as follows:

```
// src/components/message/styles.scss
.message {
  &__block {
    background-color: theme.$color-primary-3;
    position: relative;
    padding: 8px;
    color: themeDeprecated.$card-text-color;
    overflow: hidden;
    z-index: 1;
    border-radius: var(--border-radius);
  }
  //...
}
```

The `&` symbol is a parent selector in SCSS, which allows us to nest our CSS selectors in a way that follows the same visual hierarchy.

#### SCSS Conventions

We aim to follow best practices in SCSS, which include:

Using SCSS variables for colors and sizes to ensure consistency across the application.
Organizing the SCSS file in a way that mirrors the structure of the HTML document.
Using nested rules to write less code and improve readability.
Adding comments where needed to clarify the purpose of certain styles.

##### Importing Styles and Variables

The project leverages a set of pre-defined styles, animations, layout settings, variables and utility functions to ensure a consistent and easily maintainable codebase. At the start of our SCSS stylesheets, you will often see these common imports:

```
@use '~@zero-tech/zui/styles/theme' as theme;
@import '../../functions';
@import '../../animation';
@import '../../layout';
```

The `@use` rule imports the theme from the `zUI` library, allowing us to maintain a consistent theme across the application. The theme provides a set of pre-defined SCSS variables for colors, typography, and more. By importing it as `theme`, we can easily access these variables throughout our stylesheet, promoting consistency in the visual design of our application.

Meanwhile, `@import` is used to include local SCSS partials that define key functions, animations, and layout styles. These partials provide a set of reusable SCSS utilities that can be used throughout the application. By separating these utilities into different files, we promote a clean and organized code structure.

##### Using Variables and Mixins

Our stylesheets make use of SCSS variables and mixins to promote DRY (Don't Repeat Yourself) principles and maintainability. For instance:

```
$content-padding-x: 32px;
$content-padding-y: 40px;

@mixin arrow($position) {
  ...
}
```

Here, `$content-padding-x` and `$content-padding-y` are variables defined for padding settings. They are utilized throughout the stylesheet to ensure consistent spacing in the design for that specific element.

The `arrow` mixin defines a set of styles for an arrow, which can be used in different contexts in our application. It accepts a parameter `$position`, which defines the arrow's position, demonstrating how our mixins can be flexible and context-aware. This keeps our stylesheets concise and reduces redundancy, making them easier to maintain and modify.

In conclusion, our styling strategy centers on modular, reusable code snippets that maintain consistency and enhance maintainability.

We strongly encourage developers to understand and adhere to these practices when contributing to the codebase.

### Deployment

#### Production

1. Increment the version number in the `package.json` file and update the `package-lock.json` (`npm install --package-lock-only`)
1. Create a PR and merge your version update
1. View https://github.com/zer0-os/zOS/releases, find your new release and edit it, ensure that `Set as the latest release` is checked, and click the `Publish Release` button
1. View https://github.com/zer0-os/zOS/actions, watch for your release deployment to complete
1. View https://zos.zer0.io, open the Developer Tools Console, verify that your version number is correct (matches your version increment in package.json from the first step)
