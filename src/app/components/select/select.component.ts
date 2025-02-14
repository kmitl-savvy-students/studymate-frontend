import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
	selector: 'sdm-select',
	standalone: true,
	imports: [IconComponent, ReactiveFormsModule, CommonModule],
	templateUrl: './select.component.html',
	styleUrl: './select.component.css',
})
export class SDMSelectComponent implements OnInit {
	@Input() defaultLabel: string = '';
	@Input() SelectName: string = '';
	@Input() listOptions: any[] = [];
	@Input() customDdlHeader: string = '';
	@Input() customDdlOptions: string = '';
	@Input() disabled: boolean = false;
	@Output() selectedValue = new EventEmitter<{
		label: string;
		index?: number;
		value?: any;
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

	ngOnInit() {
		window.addEventListener('close-dropdowns', (event: any) => {
			if (event.detail !== this) {
				this.isDropdownOpen = false;
			}
		});
	}

	toggleDropdown() {
		this.isDropdownOpen = !this.isDropdownOpen;
		if (this.isDropdownOpen) {
			this.closeOtherDropdowns();
		}
	}

	closeOtherDropdowns() {
		const event = new CustomEvent('close-dropdowns', { detail: this });
		window.dispatchEvent(event);
	}

	get showSelectedOption(): string {
		return this.form.get('selectedOption')?.value || '';
	}

	onSelectedOption(option: string, i?: number, value?: any) {
		this.form.get('selectedOption')?.setValue(option);
		this.isSelect = option === '' ? false : true;
		this.isDropdownOpen = false;
		const data = {
			label: option,
			index: i ?? -1,
			value: value,
		};
		this.selectedValue.emit(data);
	}

	@HostListener('document:click', ['$event'])
	handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const dropdownElement = document.querySelector('.test');
		if (dropdownElement && !dropdownElement.contains(target)) {
			this.isDropdownOpen = false;
		}
	}

	preventPropagation(event: Event) {
		event.stopPropagation();
	}
}
