import * as vscode from 'vscode';
import { Spec } from './spec';
import { CodeLensProvider } from './codelensprovider';
import { Parser } from './parser';
import * as path from 'path';
import { Instruction } from './instruction';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('lucid-jasmine.runTest', (spec: Spec, instruction: Instruction) => {
		const workspace = vscode.workspace.getWorkspaceFolder(spec.document.uri);
		if (workspace) {
			const configuration = vscode.workspace.getConfiguration('jasmine-bazel');

			const terminal = (configuration.terminal === 'active' ? vscode.window.activeTerminal : undefined) ||
				(configuration.terminal === 'dedicated' && vscode.window.terminals.find((terminal) => terminal.name === 'Bazel Test')) ||
				vscode.window.createTerminal({name: 'Bazel Test', cwd: workspace.uri.path, shellPath: '/bin/bash', });
			terminal.show(true);
			const pathToWorkspace = path.relative(process.cwd(), workspace.uri.path);
			const pathToFile = path.relative(pathToWorkspace, spec.document.uri.path);
			//Prepare yourself for the most beautiful cmdline.
			const bazelType = instruction === Instruction.Test ? 'bazel' : 'ibazel';
			const bazelCommand = instruction == Instruction.Debug ? 'run' : 'test';
			const bazelOptions = ''; // or '--config=debug'
			const ruleName = configuration.ruleName || 'specs';
			const prefixSpace = configuration.noHistory ? ' ' : '';
			const cdCommand = configuration.cd === true ? `cd ${workspace.uri.path} && `: '';
			const consoleCommand = `${prefixSpace}(${cdCommand}JAS_TARGET=$(bazel query ${pathToFile}); ${bazelType} ${bazelCommand} \${JAS_TARGET%:*}:${ruleName} ${bazelOptions} --test_filter="\${JAS_TARGET#*:}${(spec.specFilter ? '#' + spec.specFilter : '')}")`;
			console.log('sending', consoleCommand);
			terminal.sendText(consoleCommand, true);
		} else {
			vscode.window.showErrorMessage('No Workspace was found, open VSCode from a bazel workspace');
		}

	});
	const languageServer = new Parser();
	const codeLensProvider = new CodeLensProvider(languageServer);
	vscode.languages.registerCodeLensProvider(codeLensProvider.selector, codeLensProvider);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
