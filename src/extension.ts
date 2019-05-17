import * as vscode from 'vscode';
import { Spec } from './spec';
import { CodeLensProvider } from './codelensprovider';
import { Parser } from './parser';
import * as path from 'path';
import { Instruction } from './instruction';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('lucidbazeltest.runTest', (spec: Spec, instruction: Instruction) => {
		// TODO: add an option to either A) use active (queue), B) always create new, C) Try to figure if active is in use, then create new, else use active
		let terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Bazel Test');
		const workspace = vscode.workspace.getWorkspaceFolder(spec.document.uri);
		if (workspace) {
			const pathToWorkspace = path.relative(process.cwd(), workspace.uri.path);
			const pathToFile = path.relative(pathToWorkspace, spec.document.uri.path);
			//Prepare yourself for the most beautiful cmdline.
			const bazelType = instruction === Instruction.Test ? 'bazel' : 'ibazel';
			const bazelCommand = instruction == Instruction.Debug ? 'run' : 'test';
			const bazelOptions = ''; // or '--config=debug'
			const ruleName = 'specs'; // TODO: add an option to specify the rule name.
			const consoleCommand = `JAS_TARGET=$(bazel query ${pathToFile}); ${bazelType} ${bazelCommand} \${JAS_TARGET%:*}:${ruleName} ${bazelOptions} --test_filter="\${JAS_TARGET#*:}${(spec.specFilter ? '#' + spec.specFilter : '')}"`;
			console.log('sending', consoleCommand);
			terminal.sendText(consoleCommand, true);

		}

	});
	const languageServer = new Parser();
	const codeLensProvider = new CodeLensProvider(languageServer);
	vscode.languages.registerCodeLensProvider(codeLensProvider.selector, codeLensProvider);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
