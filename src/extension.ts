import * as vscode from 'vscode';

interface Words {
	[src: string]: string
}
interface Dictionary {
	languages: string[];
	words: Words;
}

let config: vscode.WorkspaceConfiguration;

function getConfig(): vscode.WorkspaceConfiguration {
	const editor = vscode.window.activeTextEditor;
	const config = vscode.workspace.getConfiguration(
		'autofix',
		editor?.document.uri
	);
	return config;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-extension-autofix" is now active!');

	config = getConfig();
	vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('autofix')) {
			config = getConfig();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		let editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			const doc = event.document;
			const changes = event.contentChanges[0];
			const { line, character } = changes.range.start;
			const prevPosition = new vscode.Position(line, character - 1);
			const position = new vscode.Position(line, character);
			const newPosition = new vscode.Position(line, character + 1);
			const prevText = doc.getText(new vscode.Range(prevPosition, position));
			const withLeftBuffer = doc.getText(new vscode.Range(new vscode.Position(line, 0), newPosition));

			const last_word_regex = /[^ \t]*$/;
			const matches = last_word_regex.exec(withLeftBuffer);
			const targetWord = matches && matches.length > 0 ? matches[0] : "";

			const dictionaries = config.get<Dictionary[]>('dictionary');
			dictionaries?.forEach((dictionary: Dictionary) => {
				var languages = dictionary.languages;
				var scopedLanguageFlag = languages.some((e) => e == '*' || e == editor?.document.languageId);
				if (!scopedLanguageFlag) { return; }

				var words = dictionary.words;
				for (let key in words) {
					let src_pattern = key;
					let dst_pattern = words[key];
					let regex;
					try {
						regex = new RegExp(src_pattern + '$');
					} catch (error) {
						let result = error.toString();
						console.log('autofix extension regex compile failed: ', result);
						vscode.window.showInformationMessage('vscode-extension-eval.action: error:', result);
					}

					const matches = regex?.exec(targetWord);
					if (matches && matches.length > 0) {
						const matchedText = matches[0];
						const matchedStartPosition = new vscode.Position(line, (character + 1) - matchedText.length);
						editor?.edit(editBuilder => {
							editBuilder.replace(new vscode.Range(matchedStartPosition, newPosition), dst_pattern);
						});
					}
				}
			});
		}
	}, null, context.subscriptions);
}

export function deactivate() { }
