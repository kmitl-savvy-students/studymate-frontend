import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class LoadingService {
	private loadingCount = 0;
	private loadingSubject = new BehaviorSubject<boolean>(true);
	loading$ = this.loadingSubject.asObservable();

	private fadeInTimeoutId: ReturnType<typeof setTimeout> | null = null;
	private pulseTimeoutId: ReturnType<typeof setTimeout> | null = null;
	private midPulseTimeoutId: ReturnType<typeof setTimeout> | null = null;
	private isPulsing = false;

	register(): void {
		this.loadingCount++;
		this.updateLoadingState();
	}

	ready(): void {
		if (this.loadingCount > 0) {
			this.loadingCount--;
		}
		this.updateLoadingState();
	}

	show(afterFadeInCallback?: () => void): void {
		this.clearFadeInTimeout();

		this.loadingSubject.next(true);

		if (afterFadeInCallback) {
			this.fadeInTimeoutId = setTimeout(() => {
				afterFadeInCallback();
			}, 350);
		}
	}

	hide(): void {
		this.loadingCount = 0;
		this.clearAllTimeouts();
		this.loadingSubject.next(false);
	}

	pulse(midCallback?: () => void): void {
		if (this.isPulsing) {
			console.warn('Pulse already in progress. Ignoring this call.');
			return;
		}

		this.isPulsing = true;
		this.clearAllTimeouts();

		this.loadingSubject.next(true);

		if (midCallback) {
			this.midPulseTimeoutId = setTimeout(() => {
				midCallback();
			}, 350);
		}

		this.pulseTimeoutId = setTimeout(() => {
			this.loadingSubject.next(false);
			this.isPulsing = false;
		}, 700);
	}

	private updateLoadingState(): void {
		const isLoading = this.loadingCount > 0;
		this.loadingSubject.next(isLoading);
	}

	private clearFadeInTimeout(): void {
		if (this.fadeInTimeoutId) {
			clearTimeout(this.fadeInTimeoutId);
			this.fadeInTimeoutId = null;
		}
	}

	private clearAllTimeouts(): void {
		this.clearFadeInTimeout();
		if (this.pulseTimeoutId) {
			clearTimeout(this.pulseTimeoutId);
			this.pulseTimeoutId = null;
		}
		if (this.midPulseTimeoutId) {
			clearTimeout(this.midPulseTimeoutId);
			this.midPulseTimeoutId = null;
		}
		this.isPulsing = false;
	}
}
