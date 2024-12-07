import { Component, Input, input, OnInit } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { APIManagementService } from '../../shared/api-manage/api-management.service.js';
import { CommonModule } from '@angular/common';
import { SubjectCardData } from '../../shared/api-manage/models/SubjectCardData.model.js';
@Component({
	selector: 'sdm-subject-cpn',
	standalone: true,
	imports: [IconComponent, CommonModule],
	templateUrl: './subject.component.html',
	styleUrl: './subject.component.css',
})
export class SDMSubjectComponent{
	@Input() subjectCardData!: SubjectCardData;
	// public subjectData = [
	// 	{
	// 		subject_id : "01006003",
	// 		subject_type_name: "วิชาเลือกหมวดวิชาศึกษาทั่วไป",
	// 		subject_name_th: "คณิตศาสตร์วิศวกรรม 2",
    //         subject_name_en: "ENGINEERING MATHEMATICS 2",
	// 		credit: 3,
	// 		section: 1,
	// 		classdatetime: [ "จันทร์", "13:00-14:30", "14:45-16:15" ],
	// 		teacher_list_th:["อ. ธนภัทร ชีรณวาณิช","รศ.ดร. รวิภัทร ลาภเจริญสุข"],
	// 		teacher_list_en:["(Lecturers) Thanapath Cheeranawanith","Mr. ravipat lapcharoensuk"],
	// 		room_no:"ECC 807",
	// 		rule: "<div>เฉพาะ นศ. รหัส63010377<div><font color=\"red\">(ไม่รับนศ.อื่น)</font></div></div><div>เฉพาะ นศ. รหัส62010345<div><font color=\"red\">(ไม่รับนศ.อื่น)</font></div></div>",
	// 		review_score:4.0,
	// 		review_total:3,
	// 		student_total:30
	// 	},
	// ]
	constructor(
		private apiManagementService: APIManagementService,
	) {}
	
	// ngOnInit(): void {
	// 	throw new Error('Method not implemented.');
	// }
}
