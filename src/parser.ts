import {Position, TextDocument, Range, CancellationToken} from 'vscode';
import * as ts from 'typescript'
import {walk} from './walk';
import {Spec} from './spec';
import * as path from 'path';


export class Parser {

    public async getDescribes(src: string, document: TextDocument, token: CancellationToken) {
        const relativePath = path.relative(process.cwd(), document.uri.path);
        const srcFile = ts.createSourceFile('lambda.ts', src, ts.ScriptTarget.Latest, true);
        const specs: Spec[] = []
        walk(srcFile, (node) => {
            if (token.isCancellationRequested) {
                return true;
            }
            if (ts.isCallExpression(node)) {
                const children = node.getChildren();
                let identifier = children.find((child) => {
                    return child.kind === ts.SyntaxKind.Identifier;
                });
                if (identifier) {
                    const callName = identifier.getText();
                    if (callName === 'describe' || callName === 'it') {
                        let syntaxList = children.find((child) => {
                            return child.kind === ts.SyntaxKind.SyntaxList;
                        });
                        if (syntaxList) {
                            const describeNameNode = syntaxList.getChildAt(0);
                            let describeName: string|undefined;
                            if (describeNameNode.kind === ts.SyntaxKind.StringLiteral) {
                                describeName = describeNameNode.getText();
                            } else {
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
                            const {line: startLine, character: startCharacter} = srcFile.getLineAndCharacterOfPosition(node.getStart());
                            const startPosition = new Position(startLine, startCharacter);
                            const {line: endLine, character: endCharacter} = srcFile.getLineAndCharacterOfPosition(node.getEnd());
                            const endPosition = new Position(endLine, endCharacter);
                            specs.push(new Spec(relativePath, describeName, new Range(startPosition, endPosition), document))
                        }
                    }
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