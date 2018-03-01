import {parse} from 'babylon';
import {promisifyCode} from './promisify';

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

const promisifyAST = parse(promisifyCode, {
	sourceType: 'script'
});

export default function (babel) {
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
				}
			}
		}
	}
};