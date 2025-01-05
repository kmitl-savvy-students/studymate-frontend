import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { IconComponent } from '../icon/icon.component';

@Component({
	selector: 'sdm-rich-text-editor',
	standalone: true,
	imports: [NgxEditorModule, IconComponent],
	templateUrl: './rich-text-editor.component.html',
	styleUrl: './rich-text-editor.component.css',
	encapsulation: ViewEncapsulation.None,
})
export class SDMRichTextEditor implements OnInit, OnDestroy {
	editor: Editor;
	toolbar: Toolbar = [
		['bold', 'italic'],
		['underline', 'strike'],
		['ordered_list', 'bullet_list'],
		['align_left', 'align_center', 'align_right', 'align_justify'],
		['link'],
	];

	constructor() {
		this.editor = new Editor();
	}

	ngOnInit(): void {
		this.editor = new Editor();
	}

	ngOnDestroy(): void {
		this.editor.destroy();
	}
}
