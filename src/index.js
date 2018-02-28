const nodeJsVersionIsAboveEight = parseInt(process.version[1]) >= 10;

export default function () {
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

					const callee = nodePath.get('callee');

					if (callee.isIdentifier() && callee.equals('name', 'require')) {
						const arg = nodePath.get('arguments')[0];
						if (arg && arg.isStringLiteral() && nodePath.parentPath.isVariableDeclarator() && arg.node.value === 'util') {
							if (nodePath.parentPath.isVariableDeclarator()) {
                                nodePath.replaceWithSourceString('sege');
                                console.log(process.version);
							} else {
                nodePath.remove();
							}
						}
					}
				}
			},

			ImportDeclaration: {
				enter(nodePath, {opts}) {
					const extensionsInput = [].concat(opts.extensions || []);

					if (extensionsInput.length === 0) {
						return;
					}
					const extensions = extensionsInput.map(extFix);

					if (extensions.indexOf(path.extname(nodePath.node.source.value)) > -1) {
						const specifiers = nodePath.get('specifiers');

						if (specifiers.length > 0) {
							const specifier = specifiers[specifiers.length - 1];

							if (specifier.isImportDefaultSpecifier()) {
								throw new Error(`${nodePath.node.source.value} should not be imported using default imports.`);
							}
							if (specifier.isImportSpecifier()) {
								throw new Error(`${nodePath.node.source.value} should not be imported using named imports.`);
							}
							if (specifier.isImportNamespaceSpecifier()) {
								throw new Error(`${nodePath.node.source.value} should not be imported using namespace imports.`);
							}
						}

            nodePath.remove();
					}
				}
			}
		}
	};
}
