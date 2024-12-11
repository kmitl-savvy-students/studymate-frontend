import {
	Component,
	AfterViewInit,
	OnInit,
	ViewChildren,
	QueryList,
} from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSelectComponent } from '../../components/select/select.component';
import { SDMSearchBarComponent } from '../../components/search-bar/search-bar.component';
import { IconComponent } from '../../components/icon/icon.component';
import { SDMSubjectAddedModalComponent } from '../../components/modals/subject-added-modal/subject-added-modal.component';
import { SDMilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { SDMSubjectComponent } from '../../components/subject/subject.component';
import { SDMPaginationComponent } from '../../components/pagination/pagination.component';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model.js';
import { CommonModule } from '@angular/common';
import { APIManagementService } from '../../shared/services/api-management.service.js';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User.model';
import { distinctUntilChanged, filter, of, Subject } from 'rxjs';
import { UserToken } from '../../shared/models/UserToken.model';
import { NavigationEnd, Router } from '@angular/router';

@Component({
	selector: 'sdm-subject',
	standalone: true,
	imports: [
		SDMSelectComponent,
		SDMSearchBarComponent,
		SDMSubjectAddedModalComponent,
		SDMilterBarComponent,
		SDMPaginationComponent,
		CommonModule,
		SDMSubjectComponent,
	],
	templateUrl: './subject.page.html',
	styleUrl: './subject.page.css',
})
export class SDMSubject implements AfterViewInit, OnInit {
	@ViewChildren(SDMSelectComponent) dropdowns!: QueryList<SDMSelectComponent>;
	public currentPage: number = 1;
	public itemsPerPage: number = 10;
	public paginatedItems: SubjectCardData[] = [];
	public subjectCardTotal: number = 0;

	public selectedYear: string = '';
	public selectedSemester: string = '';
	public selectedClass: string = '';
	public selectedFaculty: string = '';
	public selectedDepartment: string = '';
	public selectedCurriculum: string = '';
	public isSelectAllDropdown: boolean = false;

	public currentRoute: string = '';
	public user: User | null = null;
	public isSignIn: boolean = false;

	public subjectCardData: SubjectCardData[] = [
		{
			subject_id: '01006003',
			subject_type_name: 'วิชาแกน',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 2',
			subject_name_en: 'ENGINEERING MATHEMATICS 2',
			credit: 3,
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
		{
			subject_id: '01006003',
			subject_type_name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 1',
			subject_name_en: 'ENGINEERING MATHEMATICS 1',
			credit: 3,
			section: 108,
			classdatetime: ['จันทร์', '13:00-14:30', ''],
			teacher_list_th: ['อ. ธัญชนก'],
			teacher_list_en: [
				'(Lecturers) Thanapath Cheeranawanith',
				'Mr. ravipat lapcharoensuk',
			],
			room_no: 'ECC 807',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '',
			review_score: 4.0,
			review_total: 3,
			student_total: 50000,
		},
		{
			subject_id: '01006001',
			subject_type_name: 'วิชาเลือกเฉพาะสาขา',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 1',
			subject_name_en: 'ENGINEERING MATHEMATICS 1',
			credit: 3,
			section: 101,
			classdatetime: ['จันทร์', '08:00-09:30', '09:45-11:15'],
			teacher_list_th: ['อ. สมชาย'],
			teacher_list_en: ['(Lecturers) Somchai'],
			room_no: 'ECC 101',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '',
			review_score: 4.0,
			review_total: 5,
			student_total: 45,
		},
		{
			subject_id: '01006002',
			subject_type_name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 2',
			subject_name_en: 'ENGINEERING MATHEMATICS 2',
			credit: 3,
			section: 102,
			classdatetime: ['อังคาร', '10:00-11:30', '13:00-14:30'],
			teacher_list_th: ['อ. มนตรี', 'อ. กิตติ'],
			teacher_list_en: ['(Lecturers) Montri', 'Mr. Kitti'],
			room_no: 'ECC 202',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010302<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.2,
			review_total: 6,
			student_total: 60,
		},
		{
			subject_id: '01006003',
			subject_type_name: 'วิชาแกน',
			subject_name_th: 'ฟิสิกส์เบื้องต้น',
			subject_name_en: 'BASIC PHYSICS',
			credit: 3,
			section: 103,
			classdatetime: ['พุธ', '08:00-09:30', '10:00-11:30'],
			teacher_list_th: ['อ. พรเทพ', 'อ. ปริญญา'],
			teacher_list_en: ['(Lecturers) Porntep'],
			room_no: 'ECC 303',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010303<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.8,
			review_total: 10,
			student_total: 70,
		},
		{
			subject_id: '01006004',
			subject_type_name: 'วิชาตามเกณฑ์ของคณะ',
			subject_name_th: 'เคมีวิศวกรรม',
			subject_name_en: 'ENGINEERING CHEMISTRY',
			credit: 4,
			section: 104,
			classdatetime: ['พฤหัส', '09:00-10:30', '11:00-12:30'],
			teacher_list_th: ['อ. วิทยา', 'อ. ปริญญา', 'อ. เจนจิรา'],
			teacher_list_en: ['(Lecturers) Witaya'],
			room_no: 'ECC 404',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010304<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 3.9,
			review_total: 3,
			student_total: 50,
		},
		{
			subject_id: '01006005',
			subject_type_name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
			subject_name_th: 'วิทยาศาสตร์คอมพิวเตอร์',
			subject_name_en: 'COMPUTER SCIENCE',
			credit: 3,
			section: 105,
			classdatetime: ['ศุกร์', '13:00-14:30', '15:00-16:30'],
			teacher_list_th: ['อ. เจนจิรา'],
			teacher_list_en: ['(Lecturers) Janejira'],
			room_no: 'ECC 505',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010305<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.7,
			review_total: 8,
			student_total: 65,
		},
		{
			subject_id: '01006006',
			subject_type_name: 'วิชาเลือกเฉพาะสาขา',
			subject_name_th: 'การบริหารจัดการ',
			subject_name_en: 'MANAGEMENT',
			credit: 3,
			section: 201,
			classdatetime: ['จันทร์', '09:00-10:30', '11:00-12:30'],
			teacher_list_th: ['อ. สมพงษ์'],
			teacher_list_en: ['(Lecturers) Sompong'],
			room_no: 'ECC 606',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010306<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.3,
			review_total: 15,
			student_total: 35,
		},
		{
			subject_id: '01006007',
			subject_type_name: 'วิชาตามเกณฑ์ของคณะ',
			subject_name_th: 'ภาษาอังกฤษสำหรับวิศวกร',
			subject_name_en: 'ENGLISH FOR ENGINEERS',
			credit: 3,
			section: 202,
			classdatetime: ['อังคาร', '14:00-15:30', '16:00-17:30'],
			teacher_list_th: ['อ. กัลยา'],
			teacher_list_en: ['(Lecturers) Kanlaya'],
			room_no: 'ECC 707',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010307<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.5,
			review_total: 12,
			student_total: 40,
		},
		{
			subject_id: '01006008',
			subject_type_name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
			subject_name_th: 'การพัฒนาซอฟต์แวร์',
			subject_name_en: 'SOFTWARE DEVELOPMENT',
			credit: 4,
			section: 203,
			classdatetime: ['พุธ', '10:00-11:30', '13:00-14:30'],
			teacher_list_th: ['อ. วรนุช'],
			teacher_list_en: ['(Lecturers) Woranuch'],
			room_no: 'ECC 808',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010308<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.0,
			review_total: 9,
			student_total: 50,
		},
		{
			subject_id: '01006009',
			subject_type_name: 'วิชาแกน',
			subject_name_th: 'การตลาดเบื้องต้น',
			subject_name_en: 'INTRODUCTION TO MARKETING',
			credit: 3,
			section: 204,
			classdatetime: ['พฤหัส', '08:30-10:00', '10:30-12:00'],
			teacher_list_th: ['อ. สุรีพร'],
			teacher_list_en: ['(Lecturers) Sureeporn'],
			room_no: 'ECC 909',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010309<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 3.8,
			review_total: 7,
			student_total: 55,
		},
		{
			subject_id: '01006010',
			subject_type_name: 'วิชาตามเกณฑ์ของคณะ',
			subject_name_th: 'การเขียนโปรแกรมขั้นสูง',
			subject_name_en: 'ADVANCED PROGRAMMING',
			credit: 3,
			section: 205,
			classdatetime: ['ศุกร์', '13:00-14:30', '15:00-16:30'],
			teacher_list_th: ['อ. ปริญญา'],
			teacher_list_en: ['(Lecturers) Parinya'],
			room_no: 'ECC 505',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010310<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.6,
			review_total: 20,
			student_total: 30,
		},
		{
			subject_id: '01006003',
			subject_type_name: 'วิชาแกน',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 2',
			subject_name_en: 'ENGINEERING MATHEMATICS 2',
			credit: 3,
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
			rule: '<div>เฉพาะ นศ. รหัส63010377<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div><div>เฉพาะ นศ. รหัส62010345<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.5,
			review_total: 3,
			student_total: 30,
		},
		{
			subject_id: '01006003',
			subject_type_name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 1',
			subject_name_en: 'ENGINEERING MATHEMATICS 1',
			credit: 3,
			section: 108,
			classdatetime: ['จันทร์', '13:00-14:30', ''],
			teacher_list_th: ['อ. ธัญชนก'],
			teacher_list_en: [
				'(Lecturers) Thanapath Cheeranawanith',
				'Mr. ravipat lapcharoensuk',
			],
			room_no: 'ECC 807',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส63010377<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div><div>เฉพาะ นศ. รหัส62010345<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.0,
			review_total: 3,
			student_total: 50000,
		},
		{
			subject_id: '01006001',
			subject_type_name: 'วิชาเลือกเฉพาะสาขา',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 1',
			subject_name_en: 'ENGINEERING MATHEMATICS 1',
			credit: 3,
			section: 101,
			classdatetime: ['จันทร์', '08:00-09:30', '09:45-11:15'],
			teacher_list_th: ['อ. สมชาย'],
			teacher_list_en: ['(Lecturers) Somchai'],
			room_no: 'ECC 101',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010301<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.0,
			review_total: 5,
			student_total: 45,
		},
		{
			subject_id: '01006002',
			subject_type_name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
			subject_name_th: 'คณิตศาสตร์วิศวกรรม 2',
			subject_name_en: 'ENGINEERING MATHEMATICS 2',
			credit: 3,
			section: 102,
			classdatetime: ['อังคาร', '10:00-11:30', '13:00-14:30'],
			teacher_list_th: ['อ. มนตรี', 'อ. กิตติ'],
			teacher_list_en: ['(Lecturers) Montri', 'Mr. Kitti'],
			room_no: 'ECC 202',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010302<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.2,
			review_total: 6,
			student_total: 60,
		},
		{
			subject_id: '01006003',
			subject_type_name: 'วิชาแกน',
			subject_name_th: 'ฟิสิกส์เบื้องต้น',
			subject_name_en: 'BASIC PHYSICS',
			credit: 3,
			section: 103,
			classdatetime: ['พุธ', '08:00-09:30', '10:00-11:30'],
			teacher_list_th: ['อ. พรเทพ', 'อ. ปริญญา'],
			teacher_list_en: ['(Lecturers) Porntep'],
			room_no: 'ECC 303',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010303<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.8,
			review_total: 10,
			student_total: 70,
		},
		{
			subject_id: '01006004',
			subject_type_name: 'วิชาตามเกณฑ์ของคณะ',
			subject_name_th: 'เคมีวิศวกรรม',
			subject_name_en: 'ENGINEERING CHEMISTRY',
			credit: 4,
			section: 104,
			classdatetime: ['พฤหัส', '09:00-10:30', '11:00-12:30'],
			teacher_list_th: ['อ. วิทยา', 'อ. ปริญญา', 'อ. เจนจิรา'],
			teacher_list_en: ['(Lecturers) Witaya'],
			room_no: 'ECC 404',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010304<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 3.9,
			review_total: 3,
			student_total: 50,
		},
		{
			subject_id: '01006005',
			subject_type_name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
			subject_name_th: 'วิทยาศาสตร์คอมพิวเตอร์',
			subject_name_en: 'COMPUTER SCIENCE',
			credit: 3,
			section: 105,
			classdatetime: ['ศุกร์', '13:00-14:30', '15:00-16:30'],
			teacher_list_th: ['อ. เจนจิรา'],
			teacher_list_en: ['(Lecturers) Janejira'],
			room_no: 'ECC 505',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010305<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.7,
			review_total: 8,
			student_total: 65,
		},
		{
			subject_id: '01006006',
			subject_type_name: 'วิชาเลือกเฉพาะสาขา',
			subject_name_th: 'การบริหารจัดการ',
			subject_name_en: 'MANAGEMENT',
			credit: 3,
			section: 201,
			classdatetime: ['จันทร์', '09:00-10:30', '11:00-12:30'],
			teacher_list_th: ['อ. สมพงษ์'],
			teacher_list_en: ['(Lecturers) Sompong'],
			room_no: 'ECC 606',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010306<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.3,
			review_total: 15,
			student_total: 35,
		},
		{
			subject_id: '01006007',
			subject_type_name: 'วิชาตามเกณฑ์ของคณะ',
			subject_name_th: 'ภาษาอังกฤษสำหรับวิศวกร',
			subject_name_en: 'ENGLISH FOR ENGINEERS',
			credit: 3,
			section: 202,
			classdatetime: ['อังคาร', '14:00-15:30', '16:00-17:30'],
			teacher_list_th: ['อ. กัลยา'],
			teacher_list_en: ['(Lecturers) Kanlaya'],
			room_no: 'ECC 707',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010307<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.5,
			review_total: 12,
			student_total: 40,
		},
		{
			subject_id: '01006008',
			subject_type_name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
			subject_name_th: 'การพัฒนาซอฟต์แวร์',
			subject_name_en: 'SOFTWARE DEVELOPMENT',
			credit: 4,
			section: 203,
			classdatetime: ['พุธ', '10:00-11:30', '13:00-14:30'],
			teacher_list_th: ['อ. วรนุช'],
			teacher_list_en: ['(Lecturers) Woranuch'],
			room_no: 'ECC 808',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010308<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.0,
			review_total: 9,
			student_total: 50,
		},
		{
			subject_id: '01006009',
			subject_type_name: 'วิชาแกน',
			subject_name_th: 'การตลาดเบื้องต้น',
			subject_name_en: 'INTRODUCTION TO MARKETING',
			credit: 3,
			section: 204,
			classdatetime: ['พฤหัส', '08:30-10:00', '10:30-12:00'],
			teacher_list_th: ['อ. สุรีพร'],
			teacher_list_en: ['(Lecturers) Sureeporn'],
			room_no: 'ECC 909',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010309<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 3.8,
			review_total: 7,
			student_total: 55,
		},
		{
			subject_id: '01006010',
			subject_type_name: 'วิชาตามเกณฑ์ของคณะ',
			subject_name_th: 'การเขียนโปรแกรมขั้นสูง',
			subject_name_en: 'ADVANCED PROGRAMMING',
			credit: 3,
			section: 205,
			classdatetime: ['ศุกร์', '13:00-14:30', '15:00-16:30'],
			teacher_list_th: ['อ. ปริญญา'],
			teacher_list_en: ['(Lecturers) Parinya'],
			room_no: 'ECC 505',
			classbuilding: 'ปฏิบัติการ-2',
			rule: '<div>เฉพาะ นศ. รหัส64010310<div><font color="red">(ไม่รับนศ.อื่น)</font></div></div>',
			review_score: 4.6,
			review_total: 20,
			student_total: 30,
		},
	];
	public subjects_added = [
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

	public yearList: string[] = [
		'ปีการศึกษา 2564',
		'ปีการศึกษา 2565',
		'ปีการศึกษา 2566',
		'ปีการศึกษา 2567',
	];
	public semesterList: string[] = ['เทอม 1', 'เทอม 2', 'เทอม 3'];
	public classList: string[] = ['ทุกชั้นปี', 'ปี 1', 'ปี 2', 'ปี 3', 'ปี 4'];
	public facultyList: string[] = [
		'คณะวิศวกรรมศาสตร์',
		'สำนักวิชาศึกษาทั่วไป',
	];
	public departmentList: string[] = ['วิศวกรรมคอมพิวเตอร์', 'ศึกษาทั่วไป'];
	public cirriculumList: string[] = [
		'วิศวกรรมคอมพิวเตอร์ พ.ศ. 2567',
		'วิศวกรรมคอมพิวเตอร์ (ต่อเนื่อง) พ.ศ. 2567',
	];

	constructor(
		private apiManagementService: APIManagementService,
		private router: Router,
		private authService: AuthService,
	) {
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((event: any) => {
				this.currentRoute = event.url;
			});
		this.subjectCardTotal = this.subjectCardData.length;
	}

	public userTokenSubject: Subject<UserToken | null> =
		new Subject<UserToken | null>();

	ngOnInit(): void {
		this.authService.userTokenSubject
			.pipe(
				filter((token) => token !== null),
				distinctUntilChanged(),
			)
			.subscribe((userToken) => {
				let user = userToken.user;
				if (user) {
					this.isSignIn = true;
					this.user = user;
				} else {
					this.isSignIn = false;
				}
			});
		this.updatePaginatedItems();
	}

	ngAfterViewInit(): void {
		initFlowbite();
		console.log('Selected Year:', this.selectedYear);
		console.log('Selected Semester:', this.selectedSemester);
		console.log('Selected Class:', this.selectedClass);
		console.log('Selected Faculty:', this.selectedFaculty);
		console.log('Selected Department:', this.selectedDepartment);
		console.log('Selected Curriculum:', this.selectedCurriculum);
		this.checkSelectAllDropdown();
	}

	public closeAllDropdowns(except?: SDMSelectComponent) {
		this.dropdowns.forEach((dropdown) => {
			if (dropdown !== except) {
				dropdown.isDropdownOpen = false;
			}
		});
	}

	public updatePaginatedItems() {
		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = start + this.itemsPerPage;
		this.paginatedItems = this.subjectCardData.slice(start, end);
	}

	public changePage(page: number) {
		this.currentPage = page;
		this.updatePaginatedItems();
	}

	public handleSelectedYearChange(selectedYear: {
		value: string;
		index?: number;
	}) {
		this.selectedYear = selectedYear.value;
		console.log('Selected Year:', this.selectedYear);
		this.checkSelectAllDropdown();
	}

	public handleSelectedSemesterChange(selectedSemester: {
		value: string;
		index?: number;
	}) {
		this.selectedSemester = selectedSemester.value;
		console.log('Selected Semester:', this.selectedSemester);
		this.checkSelectAllDropdown();
	}

	public handleSelectedClassChange(selectedClass: {
		value: string;
		index?: number;
	}) {
		this.selectedClass = selectedClass.value;
		console.log('Selected Class:', this.selectedClass);
		this.checkSelectAllDropdown();
	}

	public handleSelectedFacultyChange(selectedFaculty: {
		value: string;
		index?: number;
	}) {
		this.selectedFaculty = selectedFaculty.value;
		console.log('Selected Faculty:', this.selectedFaculty);
		this.checkSelectAllDropdown();
	}

	public handleSelectedDepartmentChange(selectedDepartment: {
		value: string;
		index?: number;
	}) {
		this.selectedDepartment = selectedDepartment.value;
		console.log('Selected Department:', this.selectedDepartment);
		this.checkSelectAllDropdown();
	}

	public handleSelectedCurriculumChange(selectedCurriculum: {
		value: string;
		index?: number;
	}) {
		this.selectedCurriculum = selectedCurriculum.value;
		console.log('Selected Curriculum:', this.selectedCurriculum);
		this.checkSelectAllDropdown();
	}

	public checkSelectAllDropdown() {
		if (
			this.selectedYear &&
			this.selectedSemester &&
			this.selectedClass &&
			this.selectedFaculty &&
			this.selectedDepartment &&
			this.selectedCurriculum
		) {
			this.isSelectAllDropdown = true;
		} else {
			this.isSelectAllDropdown = false;
		}
		console.log('isSelectAllDropdown', this.isSelectAllDropdown);
	}
}
