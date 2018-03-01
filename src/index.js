import path from 'path';
import fs from 'fs';
import {parse} from 'babylon';

const nodeJsVersionIsAboveEight = parseInt(process.version[1], 10) >= 10;

const isRequireUtilPromisify = (nodePath) => {
  const callee = nodePath.get('callee');
  if (!callee.isIdentifier() || !callee.equals('name', 'require')) {
		return false;
	}
  const arg = nodePath.get('arguments')[0];
  if (arg && arg.isStringLiteral() && nodePath.parentPath.isVariableDeclarator() && arg.node.value === 'util') {
    const parentPath = nodePath.parentPath;
    if (parentPath.isVariableDeclarator() && parentPath.node.id.type === 'ObjectPattern' && parentPath.node.id.properties[0].key.name === 'promisify') {
      return true;
    }
  }
  return false;
};

export default function (babel) {
	debugger;

	const code = fs.readFileSync('/home/keyvan/babel-plugin-transform-util-promisify/src/promisify.js', 'utf8');
	const promisifyAST = parse(code, {
		sourceType: 'script'
	});

	function extFix(ext) {
		return ext.charAt(0) === '.' ? ext : (`.${ext}`);
	}

	return {
		visitor: {
			CallExpression: {
				enter(nodePath, {opts}) {
					if (nodeJsVersionIsAboveEight) {
						return;
          }
          if (isRequireUtilPromisify(nodePath)) {
						nodePath.parentPath.parentPath.insertBefore(promisifyAST);
						nodePath.parentPath.parentPath.remove();
					}
				}
			},

			ImportDeclaration: {
				enter(nodePath, {opts}) {
					if (nodeJsVersionIsAboveEight) {
						return;
          }

					if (extensionsInput.length === 0) {
						return;
					}
					const extensions = extensionsInput.map(extFix);

					if (extensions.indexOf(path.extname(nodePath.node.source.value)) > -1) {
						const specifiers = nodePath.get('specifiers');

            nodePath.remove();
					}
				}
			}
		}
	}
};