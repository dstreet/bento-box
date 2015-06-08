Bento Box
=========

Application framework for Node.js

- Modular
- Extensible
- Stack Agnostic

## Install

```
npm install --save http://gitlab.exclamationlabs.com/bento-box/bento-box.git
```

## API

### Config

Configuration settings for Bento Box is stored in a single location.
Components should request a configuration object from Bento Box

```
bento.getConfig('router')
```

### Collections

Collections can be seen as data tunnels through Bento Box. Components can
publish and subscribe to collections to inform, or be informed of updates
to the application structure and data.

#### Publishing to a collection

```
bento.create('routes')
bento.add('routes', { method: 'get', path: '/', function(req, res) {} })
```

#### Subscribing to a collection

```
var onAdd = function(route) {}

bento.on('routes').add(onAdd)
bento.on('routes').remove(runction(route) {})
```

#### Unsubscribing from a collection

```
bento.off('routes').add(onAdd)
```

### Loading Modules

Bento Box offers a helper method to load modules. Essentially, it is
require for an entire directory tree. Additionally, collections can
be passed to the required resources to allow for direct access.

#### Loading a Directory Tree

```
var modules = bento.load('/path/to/modules')
```

#### Loading a Directory Tree With a Collection

```
var modules = bento.load('/path/to/modules', 'models')
```

## Testing

Run unit tests
```
npm test 
```

Run coverage report
```
npm run coverage
```

[Copyright (c) 2015 Exclamation Labs](LICENSE.md)