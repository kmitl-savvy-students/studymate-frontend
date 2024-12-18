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

	ngOnInit(): void {
		this.eachSubjectData = history.state.subjectData;
		if (!this.eachSubjectData) {
			console.warn('Subject data is missing after refresh.');
		}
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

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
