import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Alert, AlertService } from './alert.service';

@Component({
	selector: 'app-alert',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div *ngIf="alert" @fadeInOut class="fixed bottom-4 right-4 z-[9999] max-w-xs transform rounded-lg p-4" [ngClass]="alertClass">
			<div class="flex items-start gap-3" [@bounce]="bounceState" (@bounce.done)="onBounceDone()">
				<div>
					<p class="text-sm font-medium">{{ alert.message }}</p>
				</div>
				<button class="ml-auto text-secondary-200 hover:text-secondary-300 focus:outline-none" (click)="clearAlert()">✕</button>
			</div>
		</div>
	`,
	animations: [trigger('fadeInOut', [transition(':enter', [style({ opacity: 0, transform: 'translateY(20px)' }), animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))]), transition(':leave', [animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))])]), trigger('bounce', [state('inactive', style({ transform: 'translateY(0)' })), state('active', style({ transform: 'translateY(0)' })), transition('inactive => active', [animate('400ms ease-in-out', keyframes([style({ transform: 'translateY(0)', offset: 0 }), style({ transform: 'translateY(-10px)', offset: 0.3 }), style({ transform: 'translateY(5px)', offset: 0.5 }), style({ transform: 'translateY(0)', offset: 1 })]))])])],
})
export class AlertComponent implements OnInit {
	alert: Alert | null = null;
	bounceState: 'inactive' | 'active' = 'inactive';

	constructor(
		private alertService: AlertService,
		private cdr: ChangeDetectorRef,
	) {}

	ngOnInit(): void {
		this.alertService.alert$.subscribe((alert) => {
			if (alert) {
				if (this.alert) {
					this.triggerBounce();
				}
				this.alert = alert;
			} else {
				this.alert = null;
			}
			this.cdr.detectChanges();
		});
	}

	clearAlert(): void {
		this.alertService.clearAlert();
		this.alert = null;
		this.cdr.detectChanges();
	}

	get alertClass(): string {
		switch (this.alert?.type) {
			case 'success':
				return 'bg-success-100 text-success-300';
			case 'error':
				return 'bg-danger-100 text-danger-300';
			case 'info':
				return 'bg-info-100 text-info-300';
			case 'warning':
				return 'bg-warning-100 text-warning-300';
			default:
				return 'bg-primary-100 text-primary-300';
		}
	}

	triggerBounce(): void {
		this.bounceState = 'active';
	}

	onBounceDone(): void {
		this.bounceState = 'inactive';
	}
}
