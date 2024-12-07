import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSelectComponent } from '../../components/select/select.component';
import { SDMSearchBarComponent } from '../../components/search-bar/search-bar.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SDMSubjectAddedModalComponent } from '../../components/modals/subject-added-modal/subject-added-modal.component';
import { SDMilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { SDMSubjectComponent } from '../../components/subject/subject.component';

@Component({
	selector: 'sdm-subject',
	standalone: true,
	imports: [
		SDMSelectComponent,
		SDMSearchBarComponent,
		SDMSubjectAddedModalComponent,
		SDMilterBarComponent,
		SDMSubjectComponent,
	],
	templateUrl: './subject.page.html',
	styleUrl: './subject.page.css',
})
export class SDMSubject implements AfterViewInit {

	public subjectData = [
		{
			subject_id : "01006003",
			subject_type_name: "วิชาเลือกหมวดวิชาศึกษาทั่วไป",
			subject_name_th: "คณิตศาสตร์วิศวกรรม 2",
            subject_name_en: "ENGINEERING MATHEMATICS 2",
			credit: 3,
			section: 1,
			classdatetime: [ "จันทร์", "13:00-14:30", "14:45-16:15" ],
			teacher_list_th:["อ. ธนภัทร ชีรณวาณิช","รศ.ดร. รวิภัทร ลาภเจริญสุข"],
			teacher_list_en:["(Lecturers) Thanapath Cheeranawanith","Mr. ravipat lapcharoensuk"],
			room_no:"ECC 807",
			rule: "<div>เฉพาะ นศ. รหัส63010377<div><font color=\"red\">(ไม่รับนศ.อื่น)</font></div></div><div>เฉพาะ นศ. รหัส62010345<div><font color=\"red\">(ไม่รับนศ.อื่น)</font></div></div>",
			review_score:4.0,
			review_total:3,
			student_total:30
		},
		{
			subject_id : "01006003",
			subject_type_name: "วิชาเลือกหมวดวิชาศึกษาทั่วไป",
			subject_name_th: "คณิตศาสตร์วิศวกรรม 2",
            subject_name_en: "ENGINEERING MATHEMATICS 2",
			credit: 3,
			section: 1,
			classdatetime: [ "จันทร์", "13:00-14:30", "14:45-16:15" ],
			teacher_list_th:["อ. ธนภัทร ชีรณวาณิช","รศ.ดร. รวิภัทร ลาภเจริญสุข"],
			teacher_list_en:["(Lecturers) Thanapath Cheeranawanith","Mr. ravipat lapcharoensuk"],
			room_no:"ECC 807",
			rule: "<div>เฉพาะ นศ. รหัส63010377<div><font color=\"red\">(ไม่รับนศ.อื่น)</font></div></div><div>เฉพาะ นศ. รหัส62010345<div><font color=\"red\">(ไม่รับนศ.อื่น)</font></div></div>",
			review_score:4.0,
			review_total:3,
			student_total:30
		},
		{
			subject_id : "01006003",
			subject_type_name: "วิชาเลือกหมวดวิชาศึกษาทั่วไป",
			subject_name_th: "คณิตศาสตร์วิศวกรรม 2",
            subject_name_en: "ENGINEERING MATHEMATICS 2",
			credit: 3,
			section: 1,
			classdatetime: [ "จันทร์", "13:00-14:30", "14:45-16:15" ],
			teacher_list_th:["อ. ธนภัทร ชีรณวาณิช","รศ.ดร. รวิภัทร ลาภเจริญสุข"],
			teacher_list_en:["(Lecturers) Thanapath Cheeranawanith","Mr. ravipat lapcharoensuk"],
			room_no:"ECC 807",
			rule: "<div>เฉพาะ นศ. รหัส63010377<div><font color=\"red\">(ไม่รับนศ.อื่น)</font></div></div><div>เฉพาะ นศ. รหัส62010345<div><font color=\"red\">(ไม่รับนศ.อื่น)</font></div></div>",
			review_score:4.0,
			review_total:3,
			student_total:30
		}
	]

	subjects_added = [
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076016',
			name: 'COMPUTER ENGINEERING PROJECT PREPARATION',
			credits: 2,
			isSelected: false,
		},
		{
			code: '01076032',
			name: 'ELEMENTARY DIFFERENTIAL EQUATIONS AND LINEAR ALGEBRA',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
		{
			code: '01076149',
			name: 'CHARM SCHOOL',
			credits: 3,
			isSelected: false,
		},
	];

	ngAfterViewInit(): void {
		initFlowbite();
	}
}
