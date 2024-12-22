import { Component } from '@angular/core';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

@Component({
	selector: 'sdm-rich-text-editor',
	template: `
		<div class="NgxEditor__Wrapper">
			<ngx-editor-menu
				[editor]="editor"
				[toolbar]="toolbar"
			></ngx-editor-menu>
			<ngx-editor
				[editor]="editor"
				[placeholder]="'Type your review here...'"
			></ngx-editor>
		</div>
	`,
	imports: [NgxEditorModule],
	standalone: true,
})
export class SDMRichTextEditor {
	editor: Editor;
	toolbar: Toolbar = [
		['bold', 'italic'],
		['underline', 'strike'],
		['ordered_list', 'bullet_list'],
		['link'],
	];

	constructor() {
		this.editor = new Editor();
	}

	ngOnDestroy(): void {
		this.editor.destroy();
	}
}
