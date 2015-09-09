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
```
{
    database: // exports from database.js,
    production: // exports from production.js,
    server: {
      routes:   // exports from server/routes.js,
      settings: // exports from server/settings.js
    }
}
```

When an `index.js` file is present in a directory, it serves as the base for
all other exports in that directory. For example, see how the exports from
`database.js` override those from `index.js`.

```
// index.js
module.exports = {
    database: {
        host: 'http://localhost'
    }
}

// database.js
module.exports = {
    host: 'http://127.0.0.1'
}

// results
{
    database: {
        host: 'http://127.0.0.1'
    }
    ...
}
```

Additionally, the configuration loader is environment aware, and any top-level
exports matching the current `NODE_ENV` will override all others. Using the
above example, if the `NODE_ENV` is set to 'production':

```
// production.js
module.exports = {
    database: {
        host: 'http://68.102.3.1'
    }
}

// result
{
    database: {
        host: 'http://68.102.3.1'
    }
    ...
}
```

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