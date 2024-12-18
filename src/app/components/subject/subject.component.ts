import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { Router } from '@angular/router';
@Component({
	selector: 'sdm-subject-cpn',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './subject.component.html',
	styleUrl: './subject.component.css',
})
export class SDMSubjectComponent {
	@Input() subjectCardData!: SubjectCardData;
	@Input() index: number = 0;

	constructor(private router: Router) {}

	public checkString(dateTime: string) {
		let safeString: string = '';
		safeString = dateTime ? dateTime.trim() : '';
		return safeString;
	}

	// วิธี route ไปยังหน้า /subject/subject-detail โดยการส่งข้อมูลข้าม Tab
	// โครงสร้างข้อมูล SubjectCardData นั้นซับซ้อนและยาว การใช้ Local Storage หรือ Session Storage จะเหมาะสมกว่า เพราะช่วยหลีกเลี่ยงข้อจำกัดของ URL ความยาว (เช่นใน queryParams) และจัดการได้ง่ายกว่า
	public seeDetailSubject() {
		// เก็บข้อมูลลงใน localStorage
		sessionStorage.setItem(
			'subjectData',
			JSON.stringify(this.subjectCardData),
		);

		// เปิดแท็บใหม่
		const url = this.router.serializeUrl(
			this.router.createUrlTree(['/subject/subject-detail']),
		);
		window.open(url, '_blank');
	}

	// วิธี route ไปยังหน้า /subject/subject-detail พร้อมกับส่ง object ของแต่ละรายวิชาไปด้วย แต่ส่งข้อมูลกันภายใน Tab เดียวกัน
	// public seeDetailSubject() {
	// 	this.router.navigate(['/subject/subject-detail'], {
	// 		state: { subjectData: this.subjectCardData },
	// 	});
	// }
}
