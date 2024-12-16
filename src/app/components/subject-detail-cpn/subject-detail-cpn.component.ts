import { Component } from '@angular/core';
import { SubjectDetailData } from '../../shared/api-manage/models/SubjectDetailData.model.js';
import { APIManagementService } from '../../shared/api-manage/api-management.service';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component.js';

@Component({
	selector: 'sdm-subject-detail-cpn',
	standalone: true,
	imports: [CommonModule, IconComponent],
	templateUrl: './subject-detail-cpn.component.html',
	styleUrl: './subject-detail-cpn.component.css',
})
export class SDMSubjectDetailCpnComponent {
	public selectedSubject: SubjectDetailData | undefined;
	public subjectDetailData: SubjectDetailData[] = [
		{
			subject_id: '01006003',
			subject_type_name: 'วิชาเลือกหมวดศึกษาทั่วไป',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 3',
			subject_name_en: 'ENGINEERING MATHEMATICS 3',
			detail: 'ฟังก์ชันหลายตัวแปรและการประยุกต์ใช้ พีชคณิตของเวกเตอร์ในสามมิติ พิกัดเชิงขั้ว แคลคูลัสของฟังก์ชันจำนวนจริงสองตัวแปร การหาอนุพันธ์และปริพันธ์ของฟังก์ชันจำนวนจริงและฟังก์ชันเวกเตอร์จำนวนจริงหลายตัวแปร แนะนำปริพันธ์เส้น เส้น ระนาบ และพื้นผิว ในปริภูมิสามมิติ แคลคูลัสของฟังก์ชันจำนวนจริงในปริภูมิสามมิติ\r\nFunctions of several variables and theirs applications, Vector algebra in three dimensions, Polar coordinates, Calculus of real - valued functions of two variables, Differentiation and integration of            real - valued and vector - valued functions of multiple real variables, Introduction to line integrals, Lines, planes and surfaces in three-dimensional space, Calculus of real-valued functions in  three-dimensional space.\r\n',
			credit: 3,
			lect_hr: 3,
			prac_hr: 0,
			self_hr: 6,
			section: 1,
			classdatetime: ['จันทร์', '13:00-14:30', '14:45-16:15'],
			teacher_list_th: [
				'อ. ธนภัทร ชีรณวาณิช',
				'รศ.ดร. รวิภัทร ลาภเจริญสุข',
				'อ.กร',
			],
			teacher_list_en: [
				'(Lecturers) Thanapath Cheeranawanith',
				'Mr. ravipat lapcharoensuk',
			],
			room_no: 'ECC 802',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010310<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div><div>เฉพาะ นศ. รหัส64010310<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.5,
			review_total: 3,
			student_total: 30,
		},
	];

	constructor(private apiManagementService: APIManagementService) {
		if (this.subjectDetailData && this.subjectDetailData.length > 0) {
			this.selectedSubject = this.subjectDetailData[0];
		}
	}

	selectSubjectById(subjectId: string): void {
		this.selectedSubject = this.subjectDetailData.find(
			(subject) => subject.subject_id === subjectId,
		);
	}
}
