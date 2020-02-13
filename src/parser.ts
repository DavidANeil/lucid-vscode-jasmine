import {Position, TextDocument, Range, CancellationToken, WorkspaceConfiguration} from 'vscode';
import * as ts from 'typescript'
import {walk} from './walk';
import {Spec} from './spec';
import * as path from 'path';


export class Parser {

    public async getDescribes(src: string, document: TextDocument, token: CancellationToken, userRegExp:  RegExp|undefined) {
        const relativePath = path.relative(process.cwd(), document.uri.path);
        const srcFile = ts.createSourceFile('lambda.ts', src, ts.ScriptTarget.Latest, true);
        const specs: Spec[] = []
        walk(srcFile, (node) => {
            if (token.isCancellationRequested) {
                return true;
            }
            if (ts.isCallExpression(node)) {
                const children = node.getChildren();
                const identifier = children.find((child) => {
                    return child.kind === ts.SyntaxKind.Identifier;
                });
                if (identifier) {
                    const callName = identifier.getText();
                    let describeName: string|undefined;
                    if (userRegExp && userRegExp.test(node.getText())) {
                        const match = userRegExp.exec(node.getText());
                        if (match && match[1]) {
                            describeName = match[1];
                        }
                    } else if (callName === 'describe' || callName === 'it') {
                        let syntaxList = children.find((child) => {
                            return child.kind === ts.SyntaxKind.SyntaxList;
                        });
                        if (syntaxList) {
                            const describeNameNode = syntaxList.getChildAt(0);
                            if (describeNameNode.kind === ts.SyntaxKind.StringLiteral) {
                                describeName = describeNameNode.getText();
                            } else {
                                // find the literal if the node is module.id + ' some literal'
                                // walk(describeNameNode, (seeker) => {
                                //     if (seeker.kind === ts.SyntaxKind.StringLiteral) {
                                //         describeName = seeker.getText();
                                //         return true;
                                //     }
                                // });
                            }
                            if (describeName) {
                                describeName = describeName.substring(1, describeName.length - 1).trim();
                            }
                        }
                    } else {
                        return false;
                    }
                    const {line: startLine, character: startCharacter} = srcFile.getLineAndCharacterOfPosition(node.getStart());
                    const startPosition = new Position(startLine, startCharacter);
                    const {line: endLine, character: endCharacter} = srcFile.getLineAndCharacterOfPosition(node.getEnd());
                    const endPosition = new Position(endLine, endCharacter);
                    specs.push(new Spec(relativePath, describeName, new Range(startPosition, endPosition), document))
                }
            }

            return false;
        });
        if (token.isCancellationRequested) {
            return [];
        }

        return specs;
    }
}