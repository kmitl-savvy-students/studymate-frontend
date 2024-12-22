import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { subjectDetailData } from '../../shared/models/SubjectDetailData.model';
import { SDMSubjectReviewComponent } from '../../components/subject-review/subject-review.component';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { SDMReviewFilterComponent } from '../../components/review-filter/review-filter.component';
import { SelectedData } from '../../shared/models/SdmAppService.model';
@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [
		SDMSubjectDetailCpnComponent,
		CommonModule,
		SDMSubjectReviewComponent,
		SDMReviewFilterComponent,
	],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMPageSubjectDetail implements OnInit {
	public eachSubjectData!: SubjectCardData;
	public subjectDetail!: subjectDetailData;

	// ถ้ามี api getSubjectReviews แล้ว
	// public subjectReviewsData?: SubjectReviewData[];

	// ถ้าใช้ mockup data อยู่
	subjectReviewData: SubjectReviewData[] = [
		{
			id: 1,
			teachtable_subject: {
				id: 1,
				teachtable: {
					id: 1,
					academic_year: 2567,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 10,
				count_of_review: 5,
				rating: 4.7,
			},
			user_id: '64010267',
			review: 'วิชานี้เป็นอิ้ง 4 ค่ะ เนื้อหาหลัก ๆ คือเรียนว่า lay out บนหนังสือพิมพ์มีชื่อเรียกว่าอะไรบ้าง การตอบจดหมายจากทางบ้าน บทบรรณาธิการ โฆษณา รูปแบบ infographic โดยจะเรียนผ่านรูปแบบของสิ่งพิมพ์ เช่น หนังสือพิมพ์และนิตยสาร มีเรียนทั้งแกรมม่าและจำ prefix / suffix ด้วยค่ะ เรียนวิชานี้เราจะได้รับความรู้รอบตัวทั่วโลกไปด้วย เก็บคะแนนผ่านควิซเวลาเรียนจบบท มีงานกลุ่มคือทำคลิปวิดิโอนำเสนอสินค้าสั้นๆและทำข่าวเหมือนแม็กกาซีนค่ะ เราเรียนกับอาจารย์ปัญจนิส อาจารย์น่ารัก ใจดี positive energy สุดๆ',
			rating: 5,
			like: 19,
			date: '25 มิ.ย 64',
			subject_name_en: 'MATHEMATICS IN DAILY LIFE',
		},
		{
			id: 2,
			teachtable_subject: {
				id: 2,
				teachtable: {
					id: 2,
					academic_year: 2567,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 10,
				count_of_review: 5,
				rating: 4.7,
			},
			user_id: '64010359',
			review: 'ได้ A แล้ววว วันนี้มาแจกสรุปฮะะ ปล.สรุปเนื้อหาของปลายภาคนะคะ อาจจะไม่ครบน้าา แต่หวังว่าจะเป็นประโยชน์ให้เพื่อน ๆ ที่ลงเรียนวิชานี้ได้นะ ส่วนรีวิวลองเลื่อน ๆ อ่านได้เลยย เราเองก็เคยรีวิวไว้ก่อนหน้านี้ และยังยืนยันคำเดิมว่าเป็นวิชาที่เรียนสนุกและเอาไปใช้ได้จริงนะ มาลงเรียนกันนะ',
			rating: 4,
			like: 20,
			date: '23 มิ.ย 64',
			subject_name_en: 'CALCULUS 2',
		},
		{
			id: 3,
			teachtable_subject: {
				id: 3,
				teachtable: {
					id: 3,
					academic_year: 2567,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 10,
				count_of_review: 5,
				rating: 4.7,
			},
			user_id: '64010312',
			review: 'อาจารย์สอนโอเค เนื้อหาน่าสนใจแต่มีปัญหาเรื่องเช็คชื่อกับTA นี้ไม่เคยสายขสด2ครั้ง แต่TAเช็คว่ามาสาย5ครั้ง ต้องไปคุยกับTA ที่หลังว่าวันนั้นเข้านะ ถ้าไม่ทำก็โดนไปทั้งอย่างงั้น ส่วนตัว',
			rating: 3,
			like: 7,
			date: '1 มิ.ย 64',
			subject_name_en: 'PROJECT 2',
		},
		{
			id: 4,
			teachtable_subject: {
				id: 4,
				teachtable: {
					id: 4,
					academic_year: 2569,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 8,
				count_of_review: 5,
				rating: 3.5,
			},
			user_id: '64010009',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 2,
			like: 25,
			date: '10 มิ.ย 64',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
	];

	public selectedYear: number = 0;
	public selectedSemester: number = 0;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private apiManagementService: APIManagementService,
	) {}

	ngOnInit(): void {
		this.route.queryParams.subscribe((params) => {
			const subjectData = params['subject'];

			if (subjectData) {
				this.eachSubjectData = JSON.parse(subjectData);

				console.log('selectedYear', this.selectedYear);
				console.log('selectedSemester', this.selectedSemester);
			} else {
				this.router.navigate(['/subject']);
				console.warn('No subject data found in queryParams.');
			}
		});
		this.getSubjectDetail();
		console.log(
			'eachSubjectData from subject-page.component',
			this.eachSubjectData,
		);
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	public getSubjectDetail() {
		this.apiManagementService
			.GetCurriculumTeachtableSubject(this.eachSubjectData.subject_id)
			.subscribe({
				next: (res) => {
					console.log('API Response:', res);
					if (res) {
						this.subjectDetail = res;
					} else {
						console.log('No Subject Data Available.');
					}
				},
				error: (error) => {
					if (error.status === 404) {
						console.error('Not found');
					} else if (error.status === 500) {
						console.error('Internal Server Error');
					} else {
						console.error(
							'An unexpected error occurred:',
							error.status,
						);
					}
				},
			});
	}

	// public getSubjectReviews() {
	// 	this.apiManagementService
	// 		.GetSubjectReviewsData(this.eachSubjectData.subject_id)
	// 		.subscribe({
	// 			next: (res) => {
	// 				console.log('API Response:', res);
	// 				if (res) {
	// 					this.subjectReviewsData = res;
	// 				} else {
	// 					console.log('No Subject Reviews Data Available.');
	// 				}
	// 			},
	// 			error: (error) => {
	// 				if (error.status === 404) {
	// 					console.error('Not found');
	// 				} else if (error.status === 500) {
	// 					console.error('Internal Server Error');
	// 				} else {
	// 					console.error(
	// 						'An unexpected error occurred:',
	// 						error.status,
	// 					);
	// 				}
	// 			},
	// 		});
	// }

	public onPopularFilterChange(selectedPopular: boolean) {
		console.log('Filter Popular:', selectedPopular);
	}
	public onLatestFilterChange(selectedLastest: boolean) {
		console.log('Filter Lastest:', selectedLastest);
	}
	public onRatingFilterChange(selectedRatingData: SelectedData) {
		console.log('Filter Rating:', selectedRatingData);
	}
}
