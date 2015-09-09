Bento Box
=========

Application framework for Node.js

- Modular
- Extensible
- Stack Agnostic

## Overview

The primary purpose of Bento Box is to provide a strong and consistent
application structure with little to no opinion on various stack components.
Bento Box is completely modular, and needs only a small interface layer to work
with other various frameworks and services for your web application.

Bento Box offers what are called collections. These collections are observable
streams of data that are subscribed to by various components. These streams
will, most likely, contain modules needed to perform a particular task. One
example might be to push a route to an express instance. See Collections below
for more information.

## Install

```
npm install bento-box
```

## Basic Usage

```
var BentoBoxFactory = require('bento-box')
var bentoEmitter = BentoBoxFactory.getInstance()

bentoEmitter.on('ready', function(bento) {
    // Bento Box is ready, do something awesome
})
```

## Application Configuration

Bento Box offers centralized appliation configuration, which is loaded
asynchronously when a Bento Box instance is first created Config be default are
loaded from the `config` directory in the project root. The config loader
recursively loads files in the `config` directory has node modules. As an
example the following tree would return:

```
── config
   ├─ index.js
   ├─ server
   │  ├─ routes.js
   │  └─ settings.js
   ├─ database.js
   └─ production.js
```
```javascript
{
    database: // exports from database.js,
    production: // exports from production.js,
    server: {
      routes:   // exports from server/routes.js,
      settings: // exports from server/settings.js
    }
}
```

For more information see [Module Loader](https://github.com/dstreet/bento-box/wiki/Module-Loader) on the wiki.

## API Documentation

[View the documentation](https://github.com/dstreet/bento-box/wiki)

## Testing

Run unit tests
```
npm test 
```

Run coverage report
```
npm run coverage
```

---

[Copyright (c) 2015 David Street](LICENSE.md)