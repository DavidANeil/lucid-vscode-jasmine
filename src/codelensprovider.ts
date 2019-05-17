import * as vscode from 'vscode';
import { Spec } from './spec';
import { Parser } from './parser';
import { Instruction } from './instruction';

export class CodeLensProvider implements vscode.CodeLensProvider {
    constructor(private readonly languageServer: Parser) {}

    public get selector() {
        return {
          language: 'typescript',
          scheme: 'file',
          pattern: '**/*.spec.ts',
        }
    }

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken) {
        const describes = await this.languageServer.getDescribes(document.getText(), document, token);
        const lenses = describes.reduce((lenses, spec) => {
            if (spec.specFilter) {
                return lenses.concat([
                    new vscode.CodeLens(spec.range, {title: 'Run Test', command: 'lucidbazeltest.runTest', arguments: [spec, Instruction.Test]}),
                    new vscode.CodeLens(spec.range, {title: 'Debug Test', command: 'lucidbazeltest.runTest', arguments: [spec, Instruction.Debug]}),
                    new vscode.CodeLens(spec.range, {title: 'Watch Test', command: 'lucidbazeltest.runTest', arguments: [spec, Instruction.Watch]}),
                ]);
            } else {
                return lenses.concat([
                    new vscode.CodeLens(spec.range, {title: 'Run All Tests', command: 'lucidbazeltest.runTest', arguments: [spec, Instruction.Test]}),
                    new vscode.CodeLens(spec.range, {title: 'Debug All Tests', command: 'lucidbazeltest.runTest', arguments: [spec, Instruction.Debug]}),
                    new vscode.CodeLens(spec.range, {title: 'Watch All Tests', command: 'lucidbazeltest.runTest', arguments: [spec, Instruction.Watch]}),
                ]);
            }
        }, [] as vscode.CodeLens[]);

        return lenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, cancellationToken: vscode.CancellationToken) {
        return codeLens;
    }

}