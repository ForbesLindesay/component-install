# component-install

**This repository is no longer maintained.  If you want to maintain it, open an issue and I will transfer ownership to you and add you as a maintainer on npm so you can continue this project. It was very useful when I was using component for browser side package management but I'm now using browserify instead and I see no reason to look back.**

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
