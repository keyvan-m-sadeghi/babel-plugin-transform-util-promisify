import {test} from 'ava';
import * as babel from 'babel-core';
import babelPluginTransformRequireIgnore from './dist';

function trimLines(str) {
	return str.replace(/^\n+|\n+$/, '').replace(/\n+/g, '\n');
}

const babelAssign = (babelOptions = {}) => (t, code) => {
	code = trimLines(code);
	const transformed = babel.transform(code, babelOptions).code;
	t.not(code, transformed);
};

const babelAssignWithPlugin = babelAssign({
	plugins: [
		[
			babelPluginTransformRequireIgnore
		]
	]
});

test('should replace promisify require by promisify definition',
	babelAssignWithPlugin,
	`
	const { promisify } = require('util');
	`
  );

test('should replace promisify import by promisify definition',
	babelAssignWithPlugin,
	`
	import { promisify } from 'util';
	`
  );
