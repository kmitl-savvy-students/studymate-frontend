import { Component, AfterViewInit } from '@angular/core';
import { TableComponent } from '../../components/table/table.component';
import { CreditDashboardComponent } from '../../components/credit-dashboard/credit-dashboard.component';
import { AdviceDashboardComponent } from '../../components/advice-dashboard/advice-dashboard.component';
import { initFlowbite } from 'flowbite';
import { ImportTranscriptComponent } from '../../components/modals/import-transcript-modal/import-transcript-modal.component';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
	selector: 'sdm-my-subject',
	standalone: true,
	imports: [
		TableComponent,
		CreditDashboardComponent,
		AdviceDashboardComponent,
		ImportTranscriptComponent,
		IconComponent,
	],
	templateUrl: './my-subject.page.html',
	styleUrl: './my-subject.page.css',
})
export class SDMMySubject implements AfterViewInit {
	ngAfterViewInit(): void {
		initFlowbite();
	}
	tableHeaders = ['หมวดวิชา', 'ลงไปแล้ว', 'ขาดอีก'];
	tableRows = [
		{
			category: 'หมวดวิชาศึกษาทั่วไป',
			completed: 30,
			remaining: 0,
			subCategories: [
				{
					name: 'วิชาพื้นฐาน',
					completed: 6,
					remaining: 0,
					courses: [
						{ code: '90641001', title: 'CHARM SCHOOL' },
						{
							code: '90641002',
							title: 'DIGITAL INTELLIGENCE QUOTIENT',
						},
						{
							code: '90641003',
							title: 'SPORTS AND RECREATIONAL ACTIVITIES',
						},
					],
				},
				{
					name: 'วิชาด้านภาษาและการสื่อสาร',
					completed: 9,
					remaining: 0,
					courses: [
						{ code: '90644007', title: 'FOUNDATION ENGLISH 1' },
						{
							code: '90644008',
							title: 'FOUNDATION ENGLISH 2',
						},
						{
							code: '90644018',
							title: 'ENGLISH FOR MARKETING',
						},
					],
				},
				{
					name: 'วิชาตามเกณฑ์ของคณะ',
					completed: 3,
					remaining: 0,
					courses: [
						{
							code: '90642118',
							title: 'APPLICATION SOFTWARE FOR BUSSINESS',
						},
						{
							code: '90642036',
							title: 'PRE-ACTIVITIES FOR ENGINEERS',
						},
					],
				},
				{
					name: 'วิชาเลือกหมวดวิชาศึกษาทั่วไป',
					completed: 12,
					remaining: 0,
					courses: [
						{
							code: '90591016',
							title: 'HAPPINESS SKILLS',
						},
						{
							code: '90643035',
							title: 'KNOWLEDGE MANAGEMENT FOR INNOVATION',
						},
						{
							code: '90642110',
							title: 'FUN WITH DATA SCIENCE',
						},
						{
							code: '90642111',
							title: 'FUN WITH CODING',
						},
					],
				},
			],
		},
		{
			category: 'หมวดวิชาเฉพาะ',
			completed: 88,
			remaining: 12,
			subCategories: [
				{
					name: 'วิชาแกน',
					completed: 30,
					remaining: 0,
					subCourses: [
						{
							name: 'วิชาแกนทางคณิตศาสตร์',
							courses: [
								{ code: '01076140', title: 'CALCULUS 1' },
								{ code: '01076141', title: 'CALCULUS 2' },
								{
									code: '01076032',
									title: 'ELEMENTARY DIFFERENTIAL EQUATIONS AND LINEAR ALGEBRA',
								},
								{
									code: '01076253',
									title: 'PROBABILITY AND STATISTICS',
								},
							],
						},
						{
							name: 'วิชาแกนทางวิศวกรรม',
							courses: [
								{
									code: '01076101',
									title: 'INTRODUCTION TO COMPUTER ENGINEERING',
								},
								{
									code: '01076103',
									title: 'PROGRAMMING FUNDAMENTAL',
								},
								{
									code: '01076104',
									title: 'PROGRAMMING PROJECT',
								},
								{
									code: '01076107',
									title: 'CIRCUITS AND ELECTRONICS',
								},
								{
									code: '01076108',
									title: 'CIRCUITS AND ELECTRONICS IN PRACTICE',
								},
								{
									code: '01076012',
									title: 'DISCRETE STRUCTURE',
								},
								{
									code: '01076011',
									title: 'OPERATING SYSTEMS',
								},
								{
									code: '01076016',
									title: 'COMPUTER ENGINEERING PROJECT PREPARATION',
								},
								{
									code: '01006004',
									title: 'INDUSTRIAL TRAINING',
								},
							],
						},
					],
				},
				{
					name: 'วิชาเฉพาะด้าน',
					completed: 46,
					remaining: 6,
					subCourses: [
						{
							name: 'วิชาบังคับ',
							groups: [
								{
									groupName: 'กลุ่มเทคโนโลยีเพื่องานประยุกต์',
									courses: [
										{
											code: '01076263',
											title: 'DATABASE SYSTEMS',
										},
									],
								},
								{
									groupName:
										'กลุ่มเทคโนโลยีและวิธีการทางซอฟต์แวร์',
									courses: [
										{
											code: '01076105',
											title: 'OBJECT ORIENTED PROGRAMMING',
										},
										{
											code: '01076106',
											title: 'OBJECT ORIENTED PROGRAMMING PROJECT',
										},
										{
											code: '01076109',
											title: 'OBJECT ORIENTED DATA STRUCTURES',
										},
										{
											code: '01076110',
											title: 'OBJECT ORIENTED DATA STRUCTURES PROJECT',
										},
										{
											code: '01076119',
											title: 'WEB APPLICATION DEVELOPMENT',
										},
										{
											code: '01076120',
											title: 'WEB APPLICATION DEVELOPMENT PROJECT',
										},
										{
											code: '01076034',
											title: 'PRINCIPLES OF SOFTWARE DEVELOPMENT PROCESS',
										},
									],
								},
								{
									groupName: 'กลุ่มโครงสร้างพื้นฐานของระบบ',
									courses: [
										{
											code: '01076121',
											title: 'THEORY OF COMPUTATION',
										},
										{
											code: '01076116',
											title: 'COMPUTER NETWORKS',
										},
										{
											code: '01076117',
											title: 'COMPUTER NETWORKS IN PRACTICE',
										},
										{
											code: '01076118',
											title: 'SYSTEM PLATFORM ADMINISTRATION',
										},
										{
											code: '01076040',
											title: 'INTERNETWORKING STANDARDS AND TECHNOLOGIES',
										},
										{
											code: '01076041',
											title: 'INTERNETWORKING STANDARDS AND TECHNOLOGIES IN PRACTICE',
										},
									],
								},
								{
									groupName:
										'กลุ่มฮาร์ดแวร์และสถาปัตยกรรมคอมพิวเตอร์',
									courses: [
										{
											code: '01076112',
											title: 'DIGITAL SYSTEM FUNDAMENTALS',
										},
										{
											code: '01076113',
											title: 'DIGITAL SYSTEM FUNDAMENTALS IN PRACTICE',
										},
										{
											code: '01076114',
											title: 'COMPUTER ORGANIZATION AND ARCHITECTURE',
										},
										{
											code: '01076115',
											title: 'COMPUTER ORGANIZATION IN PRACTICE',
										},
										{
											code: '01076050',
											title: 'MICROCONTROLLER APPLICATION AND DEVELOPMENT',
										},
										{
											code: '01076051',
											title: 'MICROCONTROLLER PROJECT',
										},
									],
								},
							],
						},
						{
							name: 'วิชาบังคับเลือก (ไม่น้อยกว่า 9 หน่วยกิต)',
							courses: [
								{
									code: '01076036',
									title: 'USER EXPERIENCE AND USER INTERFACE DESIGN',
								},
								{
									code: '01076037',
									title: 'USER EXPERIENCE AND USER INTERFACE PROJECT',
								},
							],
						},
					],
				},
				{
					name: 'วิชาการศึกษาทางเลือก',
					completed: 0,
					remaining: 6,
				},
				{
					name: 'วิชาเลือกเฉพาะสาขา',
					completed: 12,
					remaining: 0,
					courses: [
						{
							code: '01076423',
							title: 'STRATEGIC PLANNING USING BOARD AND CARD GAME',
						},
						{
							code: '01076423',
							title: 'IMAGE PROCESSING',
						},
						{
							code: '01076582',
							title: 'ARTIFICIAL INTELLIGENCE',
						},
						{
							code: '01076568',
							title: 'HUMAN COMPUTER INTERACTION',
						},
					],
				},
			],
		},
		{
			category: 'หมวดวิชาเสรี',
			completed: 3,
			remaining: 3,
			subCategories: [],
		},
	];

	private calculateTotals() {
		let totalCompleted = 0;
		let totalRemaining = 0;

		for (const row of this.tableRows) {
			totalCompleted += row.completed;
			totalRemaining += row.remaining;
		}

		return { totalCompleted, totalRemaining };
	}

	get totalCredit(): number {
		// ต้องแก้ให้ดึงมาใช้จากข้อมูลที่รับมา แต่ยังไงนะ
		return 136; // ใส่เลขแมนนวลไปก่อน
	}

	get totalCompleted(): number {
		return this.calculateTotals().totalCompleted;
	}

	get totalRemaining(): number {
		return this.calculateTotals().totalRemaining;
	}
}
