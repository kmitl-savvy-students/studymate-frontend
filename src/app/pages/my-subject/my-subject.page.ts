import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIManagementService } from './../../shared/api-manage/api-management.service';
import { AuthService } from '../../shared/auth.service';
import { TranscriptData } from '../../shared/api-manage/models/TranscriptData.model';
import { CurriculumSubject } from '../../shared/api-manage/models/CurriculumSubject.model';
import { CurriculumSubgroup } from '../../shared/api-manage/models/CurriculumSubgroup.model';
import { GenedSubject } from '../../shared/api-manage/models/GenedSubject.model';
import { initFlowbite } from 'flowbite';
import { Curriculum } from '../../shared/api-manage/models/Curriculum.model';
import { CurriculumGroup } from '../../shared/api-manage/models/CurriculumGroup.model';
import { firstValueFrom } from 'rxjs';
import { GenedGroup } from '../../shared/api-manage/models/GenedGroup.model';

@Component({
	selector: 'sdm-my-subject',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './my-subject.page.html',
	styleUrls: ['./my-subject.page.css'],
})
export class SDMMySubject implements OnInit, AfterViewInit {
	public organizedData: {
		หมวดวิชาศึกษาทั่วไป: Array<{
			group: GenedGroup;
			subjects: TranscriptData[];
		}>;
		หมวดวิชาเฉพาะ: Array<{
			group: CurriculumGroup;
			subgroups: Array<{
				subgroup: CurriculumSubgroup;
				subjects: TranscriptData[];
			}>;
		}>;
	} = {
		หมวดวิชาศึกษาทั่วไป: [],
		หมวดวิชาเฉพาะ: [],
	};
	public curriculumName: string = '';
	public haveTranscriptData: boolean = false;

	// Credit requirements
	public generalStudiesCreditRequirement: number = 30;
	public specializedStudiesCreditRequirement: number = 0;

	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthService,
	) {}

	ngOnInit(): void {
		this.authService.getToken().subscribe({
			next: (userToken) => {
				if (!userToken) return;

				const userTokenId = userToken.id;
				const userId = userToken.user.id;
				const curriculum = userToken.user.curriculum;

				this.curriculumName =
					curriculum?.name_th || 'ไม่พบข้อมูลหลักสูตร';

				this.apiManagementService
					.GetTranscriptData(userTokenId, userId)
					.subscribe({
						next: (res: TranscriptData[]) => {
							const transcriptPromises = res.map((transcript) =>
								this.fetchGenedOrCurriculumData(
									transcript,
									curriculum,
								),
							);

							Promise.all(transcriptPromises).then(
								(transcriptDataWithGroups) => {
									this.organizeData(transcriptDataWithGroups);
									this.calculateSpecializedStudiesCreditRequirement();
									this.haveTranscriptData = Object.values(
										this.organizedData,
									).some((group) => group.length > 0);
								},
							);
						},
						error: (error) => {
							console.error(
								'Error fetching transcript data:',
								error,
							);
						},
					});
			},
			error: (error) => {
				console.error('Error fetching user token:', error);
			},
		});
	}

	private async fetchGenedOrCurriculumData(
		transcript: TranscriptData,
		curriculum: Curriculum,
	) {
		const subjectId = transcript.subject?.id;
		if (!subjectId) return null;

		try {
			const genedSubject = await firstValueFrom(
				this.apiManagementService.GetGenedSubject(subjectId),
			);

			if (genedSubject) {
				return {
					transcript,
					genedGroup: genedSubject.group,
					masterGroup: 'หมวดวิชาศึกษาทั่วไป' as const,
				};
			}
		} catch (error) {
			console.error(
				`Error fetching GenedSubject for subject ${subjectId}:`,
				error,
			);
		}

		const uniqueId = curriculum?.unique_id;
		const year = curriculum?.year;

		if (!uniqueId || !year) {
			return null;
		}

		try {
			const curriculumSubject = await firstValueFrom(
				this.apiManagementService.GetCurriculumSubjectByUniqueIdYear(
					subjectId,
					uniqueId,
					year,
				),
			);

			if (curriculumSubject) {
				const { category_id, group_id, subgroup_id } =
					curriculumSubject;

				const curriculumSubgroup = await firstValueFrom(
					this.apiManagementService.GetCurriculumSubgroup(
						category_id,
						group_id,
						subgroup_id,
						uniqueId,
						year,
					),
				);
				const curriculumGroup = await firstValueFrom(
					this.apiManagementService.GetCurriculumGroup(
						category_id,
						group_id,
						uniqueId,
						year,
					),
				);

				return {
					transcript,
					curriculumSubgroup,
					curriculumGroup,
					masterGroup: 'หมวดวิชาเฉพาะ' as const,
				};
			}
		} catch (error) {
			console.error(
				`Error fetching CurriculumSubject for subject ${subjectId}:`,
				error,
			);
		}

		return null;
	}

	private organizeData(data: Array<any>) {
		this.organizedData = {
			หมวดวิชาศึกษาทั่วไป: [],
			หมวดวิชาเฉพาะ: [],
		};

		for (const item of data) {
			if (item) {
				if (item.masterGroup === 'หมวดวิชาศึกษาทั่วไป') {
					let genedGroupEntry = this.organizedData[
						'หมวดวิชาศึกษาทั่วไป'
					].find((group) => group.group.id === item.genedGroup.id);

					if (!genedGroupEntry) {
						genedGroupEntry = {
							group: item.genedGroup,
							subjects: [],
						};
						this.organizedData['หมวดวิชาศึกษาทั่วไป'].push(
							genedGroupEntry,
						);
					}
					genedGroupEntry.subjects.push(item.transcript);
				} else if (item.masterGroup === 'หมวดวิชาเฉพาะ') {
					let curriculumGroupEntry = this.organizedData[
						'หมวดวิชาเฉพาะ'
					].find(
						(group) =>
							group.group.group_id ===
							item.curriculumGroup.group_id,
					);

					if (!curriculumGroupEntry) {
						curriculumGroupEntry = {
							group: item.curriculumGroup,
							subgroups: [],
						};
						this.organizedData['หมวดวิชาเฉพาะ'].push(
							curriculumGroupEntry,
						);
					}

					let subgroupEntry = curriculumGroupEntry.subgroups.find(
						(subgroup) =>
							subgroup.subgroup.subgroup_id ===
							item.curriculumSubgroup.subgroup_id,
					);

					if (!subgroupEntry) {
						subgroupEntry = {
							subgroup: item.curriculumSubgroup,
							subjects: [],
						};
						curriculumGroupEntry.subgroups.push(subgroupEntry);
					}

					subgroupEntry.subjects.push(item.transcript);
				}
			}
		}
	}

	// Calculate credit requirements for หมวดวิชาเฉพาะ
	private calculateSpecializedStudiesCreditRequirement() {
		this.specializedStudiesCreditRequirement = this.organizedData[
			'หมวดวิชาเฉพาะ'
		].reduce(
			(total, groupEntry) => total + (groupEntry.group.credit1 || 0),
			0,
		);
	}

	// Calculate earned credits for each GenedGroup
	public calculateGenedGroupCredits(group: GenedGroup): number {
		return (
			this.organizedData['หมวดวิชาศึกษาทั่วไป']
				.find(
					(genedGroupEntry) => genedGroupEntry.group.id === group.id,
				)
				?.subjects.filter(
					(subject) => subject.grade !== '0' && subject.grade !== 'F',
				) // Exclude subjects with grade "0" or "F"
				.reduce((sum, subject) => sum + (subject.credit || 0), 0) || 0
		);
	}

	// Calculate earned credits for each CurriculumGroup
	public calculateCurriculumGroupCredits(group: CurriculumGroup): number {
		return (
			this.organizedData['หมวดวิชาเฉพาะ']
				.find(
					(curriculumGroupEntry) =>
						curriculumGroupEntry.group.group_id === group.group_id,
				)
				?.subgroups.reduce(
					(subgroupSum, subgroupEntry) =>
						subgroupSum +
						subgroupEntry.subjects
							.filter(
								(subject) =>
									subject.grade !== '0' &&
									subject.grade !== 'F',
							) // Exclude subjects with grade "0" or "F"
							.reduce(
								(subjectSum, subject) =>
									subjectSum + (subject.credit || 0),
								0,
							),
					0,
				) || 0
		);
	}

	// Calculate total credits earned for each master group
	public calculateTotalCredits(
		masterGroup: 'หมวดวิชาศึกษาทั่วไป' | 'หมวดวิชาเฉพาะ',
	): number {
		return masterGroup === 'หมวดวิชาศึกษาทั่วไป'
			? this.organizedData[masterGroup].reduce(
					(sum, groupEntry) =>
						sum + this.calculateGenedGroupCredits(groupEntry.group),
					0,
				)
			: this.organizedData[masterGroup].reduce(
					(sum, groupEntry) =>
						sum +
						this.calculateCurriculumGroupCredits(groupEntry.group),
					0,
				);
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}
}
