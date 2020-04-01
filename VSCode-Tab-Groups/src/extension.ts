import * as vscode from 'vscode';
import * as _ from 'underscore';

import { ActiveEditorTracker } from './activeEditorTracker';
import { TextEditorComparer } from './comparers';
import { TabGroupDataProvider, Dependency } from './TabGroupDataProvider';
import { Group } from './igroup';




let groups: Group[] = [];
const outChannel = vscode.window.createOutputChannel('PIPPO');

export function activate(context: vscode.ExtensionContext) {
	const nodeDependenciesProvider = new TabGroupDataProvider(context);
	vscode.window.registerTreeDataProvider('TabGroupDataProvider', nodeDependenciesProvider);
	loadGroups(context);

	let disposables = [
		vscode.commands.registerCommand('extension.mysaveGroup', async () => {
			let name = await vscode.window.showInputBox({
				placeHolder: 'Enter name for group or empty for default name'
			});
			if (name === undefined) { return; }
			name = name.trim();
			if (name === '') { name = `Group${groups.length}`; }

			const openEditors = await getListOfEditors();
			const group: Group = { list: openEditors.map(e => e.document.uri.fsPath), name };
			groups.push(group);
			/**save opened editors */
			await saveAllGroups(context);
			nodeDependenciesProvider.refresh();
		}),
		vscode.commands.registerCommand('extension.myclearAndSaveGroup', async () => {
			let name = await vscode.window.showInputBox({
				placeHolder: 'Enter name for group or empty for default name'
			});
			if (name === undefined) { return; }
			name = name.trim();
			if (name === '') { name = `Group${groups.length}`; }

			const openEditors = await getListOfEditors();
			const group: Group = { list: openEditors.map(e => e.document.uri.fsPath), name };
			groups.push(group);
			await closeAllEditors();
		}),
		vscode.commands.registerCommand('extension.myrestoreGroup', async (e) => {
			let groupName: string | undefined = '';
			if (e && e.label) {
				groupName = e.label;
			} else {
				loadGroups(context);

				if (groups.length === 0) {
					vscode.window.showInformationMessage("No saved groups");
					return;
				}
				groupName = await vscode.window.showQuickPick(groups.map(g => g.name));
			}
			await closeAllEditors();
			restoreGroup(groupName);
		}),
		vscode.commands.registerCommand('extension.myclearAndRestoreGroup', async (e) => {
			if (groups.length === 0) {
				vscode.window.showInformationMessage("No saved groups");
				return;
			}
			const groupName = await vscode.window.showQuickPick(groups.map(g => g.name));
			await closeAllEditors();
			await restoreGroup(groupName);
		}),
		vscode.commands.registerCommand('extension.mydeleteGroup', async (e) => {
			let groupName: string | undefined = '';
			if (groups.length === 0) {
				vscode.window.showInformationMessage("No saved groups");
				return;
			}
			if (e && e.label) {
				groupName = e.label;
			} else {
				groupName = await vscode.window.showQuickPick(groups.map(g => g.name));
			}
			if (groupName === undefined) { return; }
			groups = groups.filter(g => g.name !== groupName);
			saveAllGroups(context);
			nodeDependenciesProvider.refresh();
		}),
	];
	context.subscriptions.concat(disposables);
}

export function deactivate() { }

async function restoreGroup(groupName: string | undefined) {
	if (groupName === undefined) { return; }
	const group = groups.find(g => g.name === groupName);
	if (!group) { return; }
	for (let i = 0; i < group.list.length; i++) {
		await vscode.window.showTextDocument(vscode.Uri.file(group.list[i]));
	}
}

async function closeAllEditors(): Promise<void> {
	async function _closeAllEditors(resolve: any) {
		const editorTracker = new ActiveEditorTracker();

		let active = vscode.window.activeTextEditor;
		let editor = active;
		const openEditors = [];
		do {
			if (editor !== null) {
				// If we didn't start with a valid editor, set one once we find it
				if (active === undefined) {
					active = editor;
				}

				openEditors.push(editor);
			}
			outChannel.appendLine('MICHELE inside do');

			editor = await editorTracker.awaitClose();
			outChannel.appendLine('MICHELE after wating');

			if (editor !== undefined &&
				openEditors.some(_ => TextEditorComparer.equals(_, editor, { useId: true, usePosition: true }))) { break; }
		} while ((active === undefined && editor === undefined) ||
			!TextEditorComparer.equals(active, editor, { useId: true, usePosition: true }));
		editorTracker.dispose();
		outChannel.appendLine('MICHELE resolving');
		resolve();
	}

	async function _closeAllEditors2(resolve: any) {
		const editorTracker = new ActiveEditorTracker();
		outChannel.appendLine('>>>>> _closeAllEditors2');

		await editorTracker.closeAllActiveTextEditors(outChannel);
		editorTracker.dispose();
		outChannel.appendLine('<<<<< _closeAllEditors2');
		resolve();
	}

	return new Promise(_closeAllEditors2);
}

async function getListOfEditors(): Promise<(vscode.TextEditor)[]> {
	const editorTracker = new ActiveEditorTracker();

	let active = vscode.window.activeTextEditor;
	let editor = active;
	const openEditors = [];
	do {
		if (editor !== null) {
			// If we didn't start with a valid editor, set one once we find it
			if (active === undefined) {
				active = editor;
			}

			openEditors.push(editor);
		}

		editor = await editorTracker.awaitNext(500);
		if (editor !== undefined &&
			openEditors.some(_ => TextEditorComparer.equals(_, editor, { useId: true, usePosition: true }))) { break; }
	} while ((active === undefined && editor === undefined) ||
		!TextEditorComparer.equals(active, editor, { useId: true, usePosition: true }));
	editorTracker.dispose();

	const ret = [];
	for (let index = 0; index < openEditors.length; index++) {
		const element = openEditors[index];
		if (element) { ret.push(element); }
	}
	return ret;
}

async function saveAllGroups(context: vscode.ExtensionContext) {
	context.workspaceState.update('myTabs', groups);
}

function loadGroups(context: vscode.ExtensionContext) {
	groups = context.workspaceState.get('myTabs') || [];
}