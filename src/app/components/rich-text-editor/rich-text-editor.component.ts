import {
	Component,
	Input,
	OnDestroy,
	OnInit,
	ViewEncapsulation,
} from '@angular/core';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'sdm-rich-text-editor',
	standalone: true,
	imports: [NgxEditorModule, IconComponent, CommonModule, FormsModule],
	templateUrl: './rich-text-editor.component.html',
	styleUrl: './rich-text-editor.component.css',
	encapsulation: ViewEncapsulation.None,
})
export class SDMRichTextEditor implements OnInit, OnDestroy {
	@Input() isEdit: boolean = false;
	public editor: Editor;
	public content: string = '';
	public toolbar: Toolbar = [
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

	logContent(): void {
		console.log('Content:', this.content);
	}
}
