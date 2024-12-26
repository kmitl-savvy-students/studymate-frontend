import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model';
import { APIManagementService } from '../../shared/services/api-management.service';
import { subjectDetailData } from '../../shared/models/SubjectDetailData.model';
import { SubjectReviewData } from '../../shared/models/SubjectReviewData.model';
import { SDMReviewFilterComponent } from '../../components/review-filter/review-filter.component';
import { SelectedData } from '../../shared/models/SdmAppService.model';
import { SDMWriteReviewBoxComponent } from '../../components/write-review-box/write-review-box.component';
@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [
		SDMSubjectDetailCpnComponent,
		CommonModule,
		SDMReviewFilterComponent,
		SDMWriteReviewBoxComponent,
	],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMPageSubjectDetail implements OnInit {
	public eachSubjectData!: SubjectCardData;
	public subjectDetail!: subjectDetailData;
	// public subjectReviewData: SubjectReviewData[] = [];

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
			user_id: '64010001',
			review: 'วิชานี้เป็นอิ้ง 4 ค่ะ เนื้อหาหลัก ๆ คือเรียนว่า lay out บนหนังสือพิมพ์มีชื่อเรียกว่าอะไรบ้าง การตอบจดหมายจากทางบ้าน บทบรรณาธิการ โฆษณา รูปแบบ infographic โดยจะเรียนผ่านรูปแบบของสิ่งพิมพ์ เช่น หนังสือพิมพ์และนิตยสาร มีเรียนทั้งแกรมม่าและจำ prefix / suffix ด้วยค่ะ เรียนวิชานี้เราจะได้รับความรู้รอบตัวทั่วโลกไปด้วย เก็บคะแนนผ่านควิซเวลาเรียนจบบท มีงานกลุ่มคือทำคลิปวิดิโอนำเสนอสินค้าสั้นๆและทำข่าวเหมือนแม็กกาซีนค่ะ เราเรียนกับอาจารย์ปัญจนิส อาจารย์น่ารัก ใจดี positive energy สุดๆ',
			rating: 5,
			like: 1,
			created: '2024-12-23',
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
			user_id: '64010002',
			review: 'ได้ A แล้ววว วันนี้มาแจกสรุปฮะะ ปล.สรุปเนื้อหาของปลายภาคนะคะ อาจจะไม่ครบน้าา แต่หวังว่าจะเป็นประโยชน์ให้เพื่อน ๆ ที่ลงเรียนวิชานี้ได้นะ ส่วนรีวิวลองเลื่อน ๆ อ่านได้เลยย เราเองก็เคยรีวิวไว้ก่อนหน้านี้ และยังยืนยันคำเดิมว่าเป็นวิชาที่เรียนสนุกและเอาไปใช้ได้จริงนะ มาลงเรียนกันนะ',
			rating: 5,
			like: 2,
			created: '2024-10-16',
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
			user_id: '64010003',
			review: 'อาจารย์สอนโอเค เนื้อหาน่าสนใจแต่มีปัญหาเรื่องเช็คชื่อกับTA นี้ไม่เคยสายขสด2ครั้ง แต่TAเช็คว่ามาสาย5ครั้ง ต้องไปคุยกับTA ที่หลังว่าวันนั้นเข้านะ ถ้าไม่ทำก็โดนไปทั้งอย่างงั้น ส่วนตัว',
			rating: 4,
			like: 3,
			created: '2023-06-01',
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
			user_id: '64010004',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 4,
			like: 4,
			created: '2024-09-15',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
		{
			id: 5,
			teachtable_subject: {
				id: 5,
				teachtable: {
					id: 5,
					academic_year: 2569,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 8,
				count_of_review: 4,
				rating: 3.5,
			},
			user_id: '64010005',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 3,
			like: 5,
			created: '2024-11-12',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
		{
			id: 6,
			teachtable_subject: {
				id: 6,
				teachtable: {
					id: 6,
					academic_year: 2569,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 8,
				count_of_review: 4,
				rating: 3.5,
			},
			user_id: '64010006',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 3,
			like: 6,
			created: '2024-05-29',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
		{
			id: 7,
			teachtable_subject: {
				id: 7,
				teachtable: {
					id: 7,
					academic_year: 2569,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 8,
				count_of_review: 4,
				rating: 3.5,
			},
			user_id: '64010007',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 2,
			like: 7,
			created: '2023-11-23',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
		{
			id: 8,
			teachtable_subject: {
				id: 8,
				teachtable: {
					id: 8,
					academic_year: 2569,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 8,
				count_of_review: 4,
				rating: 3.5,
			},
			user_id: '64010008',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 2,
			like: 8,
			created: '2024-02-14',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
		{
			id: 9,
			teachtable_subject: {
				id: 9,
				teachtable: {
					id: 9,
					academic_year: 2569,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 8,
				count_of_review: 4,
				rating: 3.5,
			},
			user_id: '64010009',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 3,
			like: 9,
			created: '2024-07-08',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
		{
			id: 10,
			teachtable_subject: {
				id: 10,
				teachtable: {
					id: 10,
					academic_year: 2569,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 8,
				count_of_review: 4,
				rating: 3.5,
			},
			user_id: '64010010',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 3,
			like: 10,
			created: '2024-03-16',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
		{
			id: 11,
			teachtable_subject: {
				id: 11,
				teachtable: {
					id: 11,
					academic_year: 2569,
					academic_term: 2,
				},
				subject_id: '90641237',
				interested: 8,
				count_of_review: 4,
				rating: 3.5,
			},
			user_id: '64010011',
			review: 'สำหรับวิชาปรัชญาหลายคนอาจจะมองว่ายากเเน่ๆลงมาเหมือนฆ่าตัวตายเเต่อ่านเม้นต์นี้ก่อนครับผมเรียนกับอ.เจินเจินครับอ.จะเน้นไปที่งานกลุ่มพรีเซ้นต์เเละก็งานในห้องอื่นๆกับควิทซ์ในกลุ่มเฟสเป็นส่วนใหญ่วิชานี้ไม่มีสอบมิดเทอมมีอีกทีคือไฟนอลเลยเนื้อหาในการจำก็เยอะอยู่เเต่ถ้าเข้าเรียนทุกคาบงานส่งครบมีสิทธิ์ได้Aสูงนะ',
			rating: 3,
			like: 11,
			created: '2024-06-25',
			subject_name_en: 'SOFTWARE DEVELOPMENT IN PRACTICE',
		},
	];

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
			} else {
				this.router.navigate(['/subject']);
			}
		});
		this.getSubjectDetail();
		// this.getSubjectReviews();
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	public getSubjectDetail() {
		this.apiManagementService
			.GetCurriculumTeachtableSubject(this.eachSubjectData.subject_id)
			.subscribe({
				next: (res) => {
					if (res) {
						this.subjectDetail = res;
						console.log('Detail Response:', res);
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
	// 		.GetSubjectReviewsBySubjectID(this.eachSubjectData.subject_id)
	// 		.subscribe({
	// 			next: (res) => {
	// 				if (res) {
	// 					this.subjectReviewData = res;
	// 					console.log(
	// 						'รีวิวของวิชานี้ :',
	// 						this.subjectReviewData,
	// 					);
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
}
