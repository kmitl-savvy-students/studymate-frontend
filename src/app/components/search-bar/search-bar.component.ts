import { Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
	selector: 'sdm-search-bar',
	standalone: true,
	imports: [IconComponent, ReactiveFormsModule],
	templateUrl: './search-bar.component.html',
	styleUrl: './search-bar.component.css',
})
export class SDMSearchBarComponent {
	searchForm: FormGroup;

	constructor(private fb: FormBuilder) {
		this.searchForm = this.fb.group({
			search: [''],
		});
	}

	onSubmit() {
		const searchValue = this.searchForm.get('search')?.value;
		console.log('searchValue : ', searchValue);
	}
}
