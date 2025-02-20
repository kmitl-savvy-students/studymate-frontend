import { AfterViewInit, Component, Input } from '@angular/core';
import { Accordion, AccordionInterface, AccordionItem, AccordionOptions } from 'flowbite';

@Component({
	selector: 'sdm-base-accordion',
	standalone: true,
	template: `
		<div [id]="accordionId" data-accordion="collapse" data-active-classes="text-dark-100" data-inactive-classes="text-dark-100">
			<h2 [id]="accordionId + '-heading'" [class.border-b-2]="!isExpanded" class="border-gray-100 p-4 hover:bg-main-10">
				<button
					type="button"
					class="flex w-full items-center justify-between gap-3"
					[attr.data-accordion-target]="'#' + accordionId + '-body'"
					[attr.aria-expanded]="accordionDefaultStatus"
					[attr.aria-controls]="accordionId + '-body'"
					(click)="isExpanded = !isExpanded">
					<div class="flex flex-col items-start">
						<div class="text-base font-semibold">{{ header }}</div>
						<div class="text-sm opacity-50">{{ subHeader }}</div>
					</div>
					<div class="flex items-center">
						<svg data-accordion-icon class="h-3 w-3 shrink-0" [class.rotate-180]="accordionDefaultStatus" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5" />
						</svg>
					</div>
				</button>
			</h2>

			<div [id]="accordionId + '-body'" class="mb-5 hidden" [attr.aria-labelledby]="accordionId + '-heading'">
				<ng-content></ng-content>
			</div>
		</div>
	`,
})
export class SDMBaseAccordion implements AfterViewInit {
	@Input() header: string = '';
	@Input() subHeader: string = '';
	@Input() accordionId: string = '';
	@Input() accordionDefaultStatus: boolean = false;

	@Input() data: any = 0;

	public isExpanded: boolean = false;
	private accordion: AccordionInterface | undefined;

	ngAfterViewInit(): void {
		this.initAccordion();
	}

	initAccordion(): void {
		setTimeout(() => {
			const container = document.getElementById(this.accordionId);
			const headingEl = document.getElementById(this.accordionId + '-heading');
			const bodyEl = document.getElementById(this.accordionId + '-body');

			if (!container || !headingEl || !bodyEl) return;

			const options: AccordionOptions = {
				alwaysOpen: false,
				activeClasses: 'text-dark-100',
				inactiveClasses: 'text-dark-100',
			};

			const items: AccordionItem[] = [
				{
					id: this.accordionId + '-item',
					triggerEl: headingEl.querySelector('button') as HTMLElement,
					targetEl: bodyEl,
					active: this.accordionDefaultStatus,
				},
			];

			this.accordion = new Accordion(container, items, options);
			this.isExpanded = this.accordionDefaultStatus;
		}, 0);
	}
}
