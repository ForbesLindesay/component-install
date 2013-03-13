# component-install
[![Build Status](https://secure.travis-ci.org/ForbesLindesay/component-install.png)](http://travis-ci.org/ForbesLindesay/component-install)
[![Dependency Status](https://gemnasium.com/ForbesLindesay/component-install.png)](https://gemnasium.com/ForbesLindesay/component-install)

Simple programmatic, asynchronous installation of a component

## Installation

    $ npm install component-install

## Usage

```javascript
var install = require('component-install');
var dev = true;
install(join(__dirname, 'my-component'), dev, function (err) {
  if (err) throw err;
});
```

## License

  MIT
