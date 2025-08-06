import { Component } from '@angular/core';
import { SDMButtonLink } from '../buttons/button-link.component';

@Component({
	selector: 'sdm-let-plan',
	standalone: true,
	imports: [SDMButtonLink],
	templateUrl: './let-plan.component.html',
	styleUrl: './let-plan.component.css',
})
export class LetPlanComponent {}
