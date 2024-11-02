import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'sdm-select',
	standalone: true,
	imports: [IconComponent, ReactiveFormsModule, CommonModule],
	templateUrl: './select.component.html',
	styleUrl: './select.component.css',
})
export class SDMSelectComponent implements OnInit {
	@Input() selectName: string = '';
	@Input() listOptions: string[] = [];
	@Output() selectedValue = new EventEmitter<{
		value: string;
		index?: number;
	}>();
	form: FormGroup;

	public isDropdownOpen: boolean = false;
	public hoveredOption: string | null = null;
	public isSelect: boolean = false;

	constructor(private fb: FormBuilder) {
		this.form = this.fb.group({
			selectedOption: [''],
		});
	}

	ngOnInit() {}

	toggleDropdown() {
		this.isDropdownOpen = !this.isDropdownOpen;
	}

	get showSelectedOption(): string {
		return this.form.get('selectedOption')?.value || '';
	}

	onSelectedOption(option: string, i?: number) {
		this.form.get('selectedOption')?.setValue(option);
		this.isSelect = option === '' ? false : true;
		this.isDropdownOpen = false;
		const data = {
			value: option,
			index: i ?? -1,
		};
		this.selectedValue.emit(data);
		// console.log('Selected option:', option);
		// console.log('Option Number:', i);
	}
}
