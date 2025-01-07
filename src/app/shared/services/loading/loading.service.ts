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
	private autoLoadTimeoutId: ReturnType<typeof setTimeout> | null = null;

	private isPulsing = false;
	private autoLoadDelay = 1000;

	constructor() {
		this.startAutoLoadTimeout();
	}

	register(serviceName: string = 'unknown'): void {
		if (this.autoLoadTimeoutId) {
			clearTimeout(this.autoLoadTimeoutId);
			this.autoLoadTimeoutId = null;
		}

		this.loadingCount++;
		console.log(`DEBUG: [SERVICES] '${serviceName}' has been registered.`);
		this.updateLoadingState();
	}

	ready(serviceName: string = 'unknown'): void {
		if (this.loadingCount > 0) {
			this.loadingCount--;
		}
		const serviceLeft = `${this.loadingCount} services left.`;
		console.log(
			`DEBUG: [SERVICES] '${serviceName}' has been done. ${
				this.loadingCount > 0 ? serviceLeft : ''
			}`,
		);
		this.updateLoadingState();

		if (this.loadingCount === 0 && !this.autoLoadTimeoutId) {
			this.startAutoLoadTimeout();
		}
	}

	show(afterFadeInCallback?: () => void): void {
		this.clearFadeInTimeout();

		this.register('Forcefully show');
		if (afterFadeInCallback) {
			this.fadeInTimeoutId = setTimeout(() => {
				afterFadeInCallback();
			}, 350);
		}
	}

	hide(): void {
		this.ready('Forcefully hide');
		if (this.loadingCount > 0) return;
		this.clearAllTimeouts();
		this.loadingSubject.next(false);
	}

	pulse(midCallback?: () => void): void {
		if (this.isPulsing) {
			console.warn('Pulse already in progress. Ignoring this call.');
			return;
		}

		this.register('Manually Pulsing');

		this.isPulsing = true;
		this.clearAllTimeouts();

		if (midCallback) {
			this.midPulseTimeoutId = setTimeout(() => {
				midCallback();
			}, 350);
		}

		this.pulseTimeoutId = setTimeout(() => {
			this.isPulsing = false;
			this.ready('Manually Pulsing');
		}, 700);
	}

	private updateLoadingState(): void {
		const isLoading = this.loadingCount > 0;
		this.loadingSubject.next(isLoading);

		if (!isLoading) {
			console.log(
				'DEBUG: [SERVICES] All services are done. Application is shown.',
			);
		}
	}

	private startAutoLoadTimeout(): void {
		this.autoLoadTimeoutId = setTimeout(() => {
			if (this.loadingCount === 0 && this.loadingSubject.value) {
				console.log(
					`DEBUG: [SERVICES] No services registered within ${this.autoLoadDelay}ms. Showing application.`,
				);
				this.loadingSubject.next(false);
			}
		}, this.autoLoadDelay);
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
