import { Injectable } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

@Injectable({
	providedIn: 'root',
})
export class FontAwesomeIconsService {
	constructor(private library: FaIconLibrary) {
		this.library.addIconPacks(fas, far, fab);
	}
}
