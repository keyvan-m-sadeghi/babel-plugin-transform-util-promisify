import {promisifyAST} from './promisify';

const nodeJsVersionIsAboveEight = parseInt(process.version[1], 10) >= 8;

const isRequireUtilPromisify = nodePath => {
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

const isImportUtilPromisify = nodePath => {
	return nodePath.node.source.value === 'util' && nodePath.node.specifiers[0].imported.name === 'promisify';
};

const getVisitorEnterFor = (assertFn, pathDepth) => nodePath => {
	if (nodeJsVersionIsAboveEight) {
		return;
	}
	if (assertFn(nodePath)) {
		let pathToReplace = nodePath;
		for (let i = 0; i < pathDepth; i++) {
			pathToReplace = pathToReplace.parentPath;
		}
		pathToReplace.insertBefore(promisifyAST);
		pathToReplace.remove();
	}
};

export default function () {
	return {
		visitor: {
			CallExpression: {
				enter: getVisitorEnterFor(isRequireUtilPromisify, 2)
			},

			ImportDeclaration: {
				enter: getVisitorEnterFor(isImportUtilPromisify, 0)
			}
		}
	};
}
