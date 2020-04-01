
'use strict';
import { commands, Disposable, TextEditor, window, OutputChannel, workspace } from 'vscode';
import { BuiltInCommands } from './constants';

export class ActiveEditorTracker extends Disposable {

    private _disposable: Disposable;
    private _resolver: any;

    constructor() {
        super(() => this.dispose());

        this._disposable = window.onDidChangeActiveTextEditor(e => this._resolver && this._resolver(e));
    }

    dispose() {
        // tslint:disable-next-line: no-unused-expression
        this._disposable && this._disposable.dispose();
    }

    async awaitClose(timeout: number = 500): Promise<TextEditor> {
        this.close();
        return this.wait(timeout);
    }

    async awaitNext(timeout: number = 500): Promise<TextEditor> {
        this.next();
        return this.wait(timeout);
    }

    async close(): Promise<{} | undefined> {
        return commands.executeCommand(BuiltInCommands.CloseActiveEditor);
    }

    async next(): Promise<{} | undefined> {
        return commands.executeCommand(BuiltInCommands.NextEditor);
    }

    async wait(timeout: number = 500): Promise<TextEditor> {
        const editor = await new Promise<TextEditor>((resolve, reject) => {
            let timer: any;

            this._resolver = (editor: TextEditor) => {
                if (timer) {
                    clearTimeout(timer as any);
                    timer = 0;
                    resolve(editor);
                }
            };

            timer = setTimeout(() => {
                resolve(window.activeTextEditor);
                timer = 0;
            }, timeout) as any;
        });
        this._resolver = undefined;
        return editor;
    }

    async closeAllActiveTextEditors(outChannel: OutputChannel): Promise<void> {
        let numOfEditors = workspace.textDocuments.length;
        outChannel.appendLine('textDocuments are ' + workspace.textDocuments.length);

        let activeEditor = window.activeTextEditor;
        outChannel.appendLine('>>>> closeAllActiveTextEditors ' + numOfEditors);
        while ((numOfEditors--) > 0 && activeEditor !== undefined) {
            outChannel.appendLine('closing editor ' + numOfEditors);
            let editorChangePromise = this.listenForEditorChange(outChannel);
            await this.close();
            activeEditor = await editorChangePromise;
            if (activeEditor === undefined) {
                activeEditor = window.activeTextEditor;
            }
            outChannel.appendLine('closed editor ' + numOfEditors);


        }
        outChannel.appendLine('<<< closeAllActiveTextEditors');

    }

    async listenForEditorChange(outChannel: OutputChannel) {
        const newEditorPromise = new Promise<TextEditor>((resolve) => {
            this._resolver = (editor: TextEditor) => {
                outChannel.appendLine('resolving on text editr change');
                this._resolver = undefined;
                resolve(editor);
            };
        });
        return newEditorPromise;
    }
}
