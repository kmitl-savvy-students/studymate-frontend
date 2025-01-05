import { Component, OnInit } from '@angular/core';
import { AlertService, Alert } from './alert.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
	selector: 'app-alert',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div
			*ngIf="alert"
			@fadeInOut
			class="fixed bottom-4 right-4 z-[9999] max-w-xs transform rounded-lg border p-4 shadow-xl"
			[ngClass]="alertClass"
		>
			<div class="flex items-start gap-3">
				<div>
					<p class="text-sm font-medium">{{ alert.message }}</p>
				</div>
				<button
					class="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none"
					(click)="clearAlert()"
				>
					✕
				</button>
			</div>
		</div>
	`,
	animations: [
		trigger('fadeInOut', [
			transition(':enter', [
				style({ opacity: 0, transform: 'translateY(20px)' }),
				animate(
					'200ms ease-out',
					style({ opacity: 1, transform: 'translateY(0)' }),
				),
			]),
			transition(':leave', [
				animate(
					'200ms ease-in',
					style({ opacity: 0, transform: 'translateY(20px)' }),
				),
			]),
		]),
	],
})
export class AlertComponent implements OnInit {
	alert: Alert | null = null;

	constructor(private alertService: AlertService) {}

	ngOnInit(): void {
		this.alertService.alert$.subscribe((alert) => {
			this.alert = alert;
		});
	}

	clearAlert(): void {
		this.alertService.clearAlert();
	}

	get alertClass(): string {
		switch (this.alert?.type) {
			case 'success':
				return 'bg-green-100 text-green-700 border-green-200';
			case 'error':
				return 'bg-red-100 text-red-700 border-red-200';
			case 'info':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'warning':
				return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	}
}
