import {
	Component,
	ElementRef,
	AfterViewInit,
	ViewChild,
	Input,
	Output,
	EventEmitter,
} from '@angular/core';

import EasyMDE from 'easymde';

@Component({
	selector: 'sdm-markdown-editor',
	standalone: true,
	template: `<textarea #editor></textarea>`,
	styleUrls: ['./markdown-editor.component.css'],
})
export class SDMMarkdownEditorComponent implements AfterViewInit {
	@ViewChild('editor') editor!: ElementRef;
	@Input() initialValue: string = ''; // รับค่าเริ่มต้นของ Markdown
	@Output() contentChange = new EventEmitter<string>(); // ส่งค่ากลับเมื่อมีการเปลี่ยนแปลง

	easyMDE: EasyMDE | null = null;

	constructor() {}
	ngAfterViewInit(): void {
		this.easyMDE = new EasyMDE({
			element: this.editor.nativeElement,
			initialValue: this.initialValue,
			spellChecker: false,
			autosave: {
				enabled: true,
				uniqueId: 'angular-easymde',
			},
		});

		// ฟังการเปลี่ยนแปลงค่า
		if (this.easyMDE) {
			this.easyMDE.codemirror.on('change', () => {
				this.contentChange.emit(this.easyMDE?.value());
			});
		}
	}

	// ฟังก์ชันเพื่อดึงค่า Markdown
	getMarkdown(): string {
		return this.easyMDE?.value() ?? '';
	}

	// ฟังก์ชันเพื่อเซ็ตค่า Markdown
	setMarkdown(content: string): void {
		this.easyMDE?.value(content);
	}
}
