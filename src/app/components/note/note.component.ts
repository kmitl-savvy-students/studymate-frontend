import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Note } from '../../models/Note.model';

@Component({
	standalone: true,
	selector: 'app-note',

	imports: [ReactiveFormsModule],

	templateUrl: './note.component.html',
})
export class NoteComponent {
	@Input() note!: Note;
	@ViewChild('noteElement') noteElement!: ElementRef<HTMLElement>;

	isEditing: boolean = false;

	editEnable() {
		this.isEditing = true;
		this.noteElement.nativeElement.innerText = this.note.text;
	}
	editDisable() {
		this.isEditing = false;
		this.note.text = this.noteElement.nativeElement.innerText;
	}
}
