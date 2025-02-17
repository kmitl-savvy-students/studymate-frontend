import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { loadingSkeletonType } from '../../shared/models/SdmAppService.model.js';

@Component({
	selector: 'sdm-loading-skeleton',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './loading-skeleton.component.html',
	styleUrl: './loading-skeleton.component.css',
})
export class SDMLoadingSkeletonComponent {
	@Input() lines: number = 1;
	@Input() loadingType: number = 101;
	public lineArray: number[] = [];
	public loadingSkeletonType = loadingSkeletonType;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['lines']) {
			this.lineArray = Array(this.lines).fill(0);
		}
	}
}
