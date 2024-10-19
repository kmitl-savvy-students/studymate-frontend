import { Component, Input, OnInit } from '@angular/core';
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
	form: FormGroup;

	constructor(private fb: FormBuilder) {
		this.form = this.fb.group({
			selectedOption: [''],
		});
	}

	ngOnInit() {
		this.form.get('selectedOption')?.valueChanges.subscribe((value) => {
			console.log('Selected option:', value);
		});
	}

	onOptionChange() {
		const selectedValue = this.form.get('selectedOption')?.value;
		console.log('Selected option:', selectedValue);
	}

	isDropdownOpen = false;
	hoveredOption: string | null = null;

	toggleDropdown() {
		this.isDropdownOpen = !this.isDropdownOpen;
	}

	selectOption(option: string) {
		this.form.get('selectedOption')?.setValue(option);
		this.isDropdownOpen = false;
		console.log('Selected option:', option);
	}
}
