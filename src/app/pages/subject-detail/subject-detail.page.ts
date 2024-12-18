import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SDMSubjectDetailCpnComponent } from '../../components/subject-detail-cpn/subject-detail-cpn.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubjectCardData } from '../../shared/models/SubjectCardData.model';
@Component({
	selector: 'sdm-page-subject-detail',
	standalone: true,
	imports: [SDMSubjectDetailCpnComponent, CommonModule],
	templateUrl: './subject-detail.page.html',
	styleUrl: './subject-detail.page.css',
})
export class SDMPageSubjectDetail implements OnInit {
	public eachSubjectData!: SubjectCardData;

	constructor(private router: Router) {}

	// วิธีการดึงข้อมูลจาก sessionStorage แบบข้าม Tab
	ngOnInit(): void {
		const storedData = sessionStorage.getItem('subjectData');

		if (storedData) {
			// แปลงข้อมูลกลับจาก JSON string เป็น Object
			this.eachSubjectData = JSON.parse(storedData);
		} else {
			// กรณีไม่มีข้อมูล ให้ redirect กลับไปหน้า subject
			this.router.navigate(['/subject']);
			console.warn('No subject data found in localStorage.');
		}
	}

	// วิธีการดึงข้อมูลจาก  history.state แบบใน Tab เดียวกัน
	// ngOnInit(): void {
	// 	this.eachSubjectData = history.state.subjectData;
	// 	// หากไม่มีข้อมูลที่ส่งมาจาก state ให้ navigate กลับไปที่ /subject
	// 	if (!this.eachSubjectData) {
	// 		console.warn('ไม่มีข้อมูลที่ส่งมาจาก state');
	// 		this.router.navigate(['/subject']);
	// 	}
	// }

	ngAfterViewInit(): void {
		initFlowbite();
	}

	// ไม่ได้ใช้

	// constructor(
	// 	private route: ActivatedRoute,
	// 	private apiManagementService: APIManagementService,
	// ) {}

	// ngOnInit(): void {
	// 	const subject_id = this.route.snapshot.paramMap.get('subject_id');
	// 	const section = this.route.snapshot.paramMap.get('section');

	// 	if (subject_id && section) {
	// 		this.fetchSubjectDetail(subject_id, section);
	// 	}
	// }

	// private fetchSubjectDetail(subject_id: string, section: string): void {
	// 	this.apiManagementService
	// 		.getSubjectDetail(subject_id, section)
	// 		.subscribe({
	// 			next: (data: SubjectCardData) => {
	// 				this.subjectData = data;
	// 				console.log('Subject Data:', this.subjectData);
	// 			},
	// 			error: (err) =>
	// 				console.error('Failed to fetch subject detail', err),
	// 		});
	// }

	// ngOnInit(): void {
	// 	// ดึงข้อมูล subjectData จาก state ที่ส่งมา
	// 	if (history.state.subjectData) {
	// 		this.subjectData = history.state.subjectData;
	// 	} else {
	// 		console.warn('Subject data is missing!');
	// 	}
	// }
}
