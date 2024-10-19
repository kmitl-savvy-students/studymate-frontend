import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icon/icon.component';

@Component({
	selector: 'sdm-subject-added-modal',
	standalone: true,
	imports: [CommonModule, FormsModule, IconComponent],
	templateUrl: './subject-added-modal.component.html',
	styleUrls: ['./subject-added-modal.component.css'],
})
export class SDMSubjectAddedModalComponent {
	@Input() modalID: string = '';
	@Input() headerModal: string = '';
	@Input() subjects_added: {
		code: string;
		name: string;
		credits: number;
		isSelected: boolean;
	}[] = [];

	masterSelected: boolean = false;
	checkedList: any[] = [];
	totalCredits: number = 0; // เพิ่มตัวแปรสำหรับหน่วยกิตรวม
	totalCreditsAll = 0;

	constructor(private cdr: ChangeDetectorRef) {}

	ngOnInit() {
		// ตรวจสอบว่ามี subjects_added หรือไม่ ถ้ามีก็จะทำการคัดลอกเข้า subjects
		if (this.subjects_added.length > 0) {
			this.subjects_added = [...this.subjects_added];
		}
		this.calculateTotalCredits(); // คำนวณหน่วยกิตรวมในตอนเริ่มต้น
		this.calculateTotalCreditsAll();
	}

	// ฟังก์ชันอื่นๆ ที่คุณได้สร้างไว้ในก่อนหน้านี้
	checkUncheckAll() {
		for (const subject of this.subjects_added) {
			subject.isSelected = this.masterSelected;
		}
		this.getCheckedItemList();
		this.cdr.detectChanges(); // บังคับให้ Angular ตรวจสอบการเปลี่ยนแปลง
		this.calculateTotalCredits();
	}

	isAllSelected() {
		this.masterSelected = this.subjects_added.every(
			(subject) => subject.isSelected,
		);
		this.getCheckedItemList();
		this.calculateTotalCredits();
	}

	getCheckedItemList() {
		this.checkedList = this.subjects_added.filter(
			(subject) => subject.isSelected,
		);
	}

	calculateTotalCredits() {
		this.totalCredits = this.subjects_added
			.filter((subject) => subject.isSelected) // เลือกเฉพาะวิชาที่ถูกเลือก
			.reduce((acc, subject) => acc + subject.credits, 0); // รวมหน่วยกิตของวิชาที่ถูกเลือก
	}

	calculateTotalCreditsAll() {
		this.totalCreditsAll = this.subjects_added.reduce(
			(acc, subject) => acc + subject.credits,
			0,
		); // รวมหน่วยกิตของทุกวิชา
	}
}
