import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Context } from 'vm';
import { Group } from './igroup';

export class TabGroupDataProvider implements vscode.TreeDataProvider<Dependency> {
    private groups: Group[];
    private _context: vscode.ExtensionContext;

    constructor(private context: vscode.ExtensionContext) {
        this._context = context;
        this.groups = this._context.workspaceState.get('myTabs') || [];
    }
    /*  */
    getChildren(element?: any) {

        if (element === undefined) {
            const groupNames = this.groups.map(group => new Dependency(group.name, '1', vscode.TreeItemCollapsibleState.Collapsed));
            return Promise.resolve(groupNames);
        } else {
            const group = this.groups.find(group => group.name === element.label) || null;
            if (group) {
                const fileList = group.list.map(uri => new Dependency(uri, '1', vscode.TreeItemCollapsibleState.None));
                return Promise.resolve(fileList);
            }
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined> = new vscode.EventEmitter<Dependency | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this._onDidChangeTreeData.event;

    apply(): void {
        console.log('apply');
    }

    refresh(): void {

        this.groups = this._context.workspaceState.get('myTabs') || [];
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Dependency): vscode.TreeItem {
        return element;
    }


}

export class Dependency extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        private version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
    ) {
        super(label, collapsibleState);
        this.label = this.trimBaseDir(label);
    }

    trimBaseDir(label: string) {
        let folderPath = vscode.workspace.rootPath || '';
        label = label.replace(folderPath, '');
        return label.charAt(0) === ('/') || label.charAt(0) === ('\\') ? label.substring(1) : label;
    }

}