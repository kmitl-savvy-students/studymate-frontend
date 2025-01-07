import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
	private alertSubject = new BehaviorSubject<Alert | null>(null);
	alert$ = this.alertSubject.asObservable();
	private timeoutId: any;

	showAlert(
		type: 'success' | 'error' | 'info' | 'warning',
		message: string,
		duration: number = 5000,
	): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}

		this.alertSubject.next({ type, message });

		this.timeoutId = setTimeout(() => {
			this.clearAlert();
		}, duration);
	}

	clearAlert(): void {
		this.alertSubject.next(null);

		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}
}

export interface Alert {
	type: 'success' | 'error' | 'info' | 'warning';
	message: string;
}
