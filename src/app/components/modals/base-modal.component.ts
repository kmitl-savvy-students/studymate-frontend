import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { Modal, ModalInterface, ModalOptions } from 'flowbite';
import { SDMBaseButton } from '../buttons/base-button.component';

@Component({
	selector: 'sdm-base-modal',
	imports: [CommonModule, SDMBaseButton],
	standalone: true,
	template: `
		<div [id]="modalId" tabindex="-1" class="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0">
			<div class="relative max-h-full w-full max-w-xl p-4">
				<div class="relative rounded-lg bg-white shadow">
					<div class="flex items-center justify-between rounded-t border-b p-4 md:p-5">
						<h3 class="text-lg font-semibold text-gray-900">
							{{ header }}
						</h3>
					</div>
					<div class="p-4 md:p-5">
						<ng-content />
						<div class="basis flex gap-2">
							<ng-container *ngIf="!normalModal && !turnbackModal">
								<div class="w-1/2">
									<sdm-base-button icon="xmark" text="ยกเลิก" textColor="text-light" textColorHover="text-light" backgroundColor="bg-danger-300" backgroundColorHover="hover:bg-danger-400" (clickEvent)="handleCancel()" />
								</div>
								<div class="w-1/2">
									<sdm-base-button icon="check" text="ตกลง" textColor="text-light" textColorHover="text-light" backgroundColor="bg-primary-300" backgroundColorHover="hover:bg-primary-400" (clickEvent)="handleConfirm()" />
								</div>
							</ng-container>
							<ng-container *ngIf="!turnbackModal && normalModal">
								<div class="w-full">
									<sdm-base-button icon="xmark" text="ปิด" textColor="text-black" textColorHover="text-light" backgroundColor="bg-gray-300" backgroundColorHover="hover:bg-gray-400" (clickEvent)="handleCancel()" />
								</div>
							</ng-container>
							<ng-container *ngIf="!normalModal && turnbackModal">
								<div class="w-1/2">
									<sdm-base-button
										icon="right-to-bracket"
										text="ย้อนกลับ"
										textColor="text-light"
										textColorHover="text-light"
										backgroundColor="bg-main-100"
										backgroundColorHover="hover:bg-main-200"
										(clickEvent)="handleConfirm()" />
								</div>
								<div class="w-1/2">
									<sdm-base-button icon="xmark" text="ปิด" textColor="text-black" textColorHover="text-light" backgroundColor="bg-gray-300" backgroundColorHover="hover:bg-gray-400" (clickEvent)="handleCancel()" />
								</div>
							</ng-container>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
})
export class SDMBaseModal implements AfterViewInit {
	@Input() modalId: string = '';
	@Input() header: string = '';
	@Input() normalModal: boolean = false;
	@Input() turnbackModal: boolean = false;

	@Output() confirmEvent = new EventEmitter<void>();
	@Output() cancelEvent = new EventEmitter<void>();
	private cancelEventHasSubscribers = false;

	modal: ModalInterface | undefined;

	constructor() {}

	ngAfterViewInit(): void {
		const $modal = document.getElementById(this.modalId);
		const options: ModalOptions = {
			backdrop: 'static',
		};
		this.modal = new Modal($modal, options);

		this.cancelEvent.subscribe(() => {
			this.cancelEventHasSubscribers = true;
		});
	}

	show(): void {
		this.modal?.show();
	}
	hide(): void {
		this.modal?.hide();
	}

	handleCancel(): void {
		if (this.cancelEvent.observers.length === 0) {
			this.hide();
		} else {
			this.cancelEvent.emit();
		}
	}
	handleConfirm(): void {
		this.confirmEvent.emit();
	}
}
