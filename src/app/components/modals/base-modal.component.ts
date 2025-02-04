import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
import { SDMBaseButton } from '../buttons/base-button.component';
import { Modal, ModalInterface, ModalOptions } from 'flowbite';

@Component({
	selector: 'sdm-base-modal',
	standalone: true,
	template: `
		<div
			[id]="modalId"
			data-modal-backdrop="static"
			tabindex="-1"
			class="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0"
		>
			<div class="relative max-h-full w-full max-w-xl p-4">
				<div
					class="relative rounded-lg bg-white shadow dark:bg-gray-700"
				>
					<div
						class="flex items-center justify-between rounded-t border-b p-4 dark:border-gray-600 md:p-5"
					>
						<h3
							class="text-lg font-semibold text-gray-900 dark:text-white"
						>
							{{ header }}
						</h3>
					</div>
					<div class="p-4 md:p-5">
						<ng-content />
						<div class="basis flex gap-2">
							<div class="w-1/2">
								<sdm-base-button
									icon="xmark"
									text="ยกเลิก"
									textColor="text-white"
									backgroundColor="bg-red-500"
									backgroundColorHover="bg-red-600"
									(clickEvent)="handleCancel()"
								/>
							</div>
							<div class="w-1/2">
								<sdm-base-button
									icon="check"
									text="ตกลง"
									textColor="text-white"
									backgroundColor="bg-main-100"
									backgroundColorHover="bg-main-120"
									(clickEvent)="handleConfirm()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
	imports: [SDMBaseButton],
})
export class SDMBaseModal implements AfterViewInit {
	@Input() modalId: string = '';
	@Input() header: string = '';

	@Output() confirmEvent = new EventEmitter<void>();
	@Output() cancelEvent = new EventEmitter<void>();

	modal: ModalInterface | undefined;

	constructor() {}

	ngAfterViewInit(): void {
		const $modal = document.getElementById(this.modalId);
		const options: ModalOptions = {
			backdrop: 'static',
		};
		this.modal = new Modal($modal, options);
	}

	show(): void {
		this.modal?.show();
	}
	hide(): void {
		this.modal?.hide();
	}

	handleCancel(): void {
		this.hide();
		this.cancelEvent.emit();
	}
	handleConfirm(): void {
		this.hide();
		this.confirmEvent.emit();
	}
}
