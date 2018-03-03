# babel-plugin-transform-util-promisify
Transforms `util.promisify` to a function definition
for node versions &lt; 8, automatically detects if node version >= 8 and does nothing if so.

## Install

```shell
npm install babel-plugin-transform-util-promisify --save-dev
```

## Usage

Add at the top of plugins in `.babelrc`:

```json
{
  "plugins": [
    "transform-util-promisify"
    ],
    "presets": [
      ["env", {
        "targets": {
          "node": "current"
        }
      }]
    ]
}
```

The plugin currently transforms code only in these forms:

```js
import { promisify } from 'util';
```

and

```js
const { promisify } = require('promisify');
```

## License

[MIT](https://github.com/assister-ai/babel-plugin-transform-util-promisify/blob/master/LICENSE)
