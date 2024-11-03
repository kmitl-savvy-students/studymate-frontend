I want to sort a subjects by subject group and subgroup in this Typescript Angular page.
This is the current source code.

```
import { APIManagementService } from './../../shared/api-manage/api-management.service';
import {
	Component,
	OnInit,
	AfterViewInit,
	EventEmitter,
	Output,
} from '@angular/core';
import { TableComponent } from '../../components/table/table.component';
import { CreditDashboardComponent } from '../../components/credit-dashboard/credit-dashboard.component';
import { AdviceDashboardComponent } from '../../components/advice-dashboard/advice-dashboard.component';
import { initFlowbite } from 'flowbite';
import { ImportTranscriptComponent } from '../../components/modals/import-transcript-modal/import-transcript-modal.component';
import { IconComponent } from '../../components/icon/icon.component';
import { AuthService } from '../../shared/auth.service';
import { SDMConfirmDeleteModalComponent } from '../../components/modals/delete-modal/confirm-delete-modal.component';
import { TranscriptData } from '../../shared/api-manage/models/TranscriptData.model';

type CategoryName = 'หมวดวิชาศึกษาทั่วไป' | 'หมวดวิชาเฉพาะ' | 'หมวดวิชาเสรี';

@Component({
	selector: 'sdm-my-subject',
	standalone: true,
	imports: [
		TableComponent,
		CreditDashboardComponent,
		AdviceDashboardComponent,
		ImportTranscriptComponent,
		IconComponent,
		SDMConfirmDeleteModalComponent,
	],
	templateUrl: './my-subject.page.html',
	styleUrls: ['./my-subject.page.css'],
})
export class SDMMySubject implements OnInit, AfterViewInit {
	private _totalCompleted: number = 0;
	public tableHeaders: string[] = ['หมวดวิชา', 'ลงไปแล้ว', 'ขาดอีก'];
	public tableRows: any[] = [];
	public transcriptData: TranscriptData[] = [];
	public haveTranscriptData: boolean = false;

	constructor(
		private apiManagementService: APIManagementService,
		private authService: AuthService,
	) {}

	ngOnInit(): void {
		this.authService.getToken().subscribe({
			next: (userToken) => {
				if (!userToken) {
					return;
				}

				const userTokenId = userToken.id;
				const userId = userToken.user.id;

				this.apiManagementService
					.GetTranscriptData(userTokenId, userId)
					.subscribe({
						next: (res: TranscriptData[]) => {
							console.log('this is res from api=>', res);
							this.transcriptData = res;
							// this.transcriptData !== null
							// 	? (this.haveTranscriptData = true)
							// 	: (this.haveTranscriptData = false);
							this.haveTranscriptData =
								!!this.transcriptData.length; // Check if data exists
							this.processTranscriptData(this.transcriptData);
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
			},
		});
	}

	ngAfterViewInit(): void {
		initFlowbite();
	}

	private subjectTitleMap: { [key: string]: string } = {
		'90641001': 'CHARM SCHOOL',
		'90641002': 'DIGITAL INTELLIGENCE QUOTIENT',
		'90641003': 'SPORTS AND RECREATIONAL ACTIVITIES',
		'90644007': 'FOUNDATION ENGLISH 1',
		'90644008': 'FOUNDATION ENGLISH 2',
		// ... add other mappings
	};

	private categoryCreditRequirements: { [key in CategoryName]: number } = {
		หมวดวิชาศึกษาทั่วไป: 30,
		หมวดวิชาเฉพาะ: 100,
		หมวดวิชาเสรี: 6,
	};

	private processTranscriptData(transcriptData: any[]) {
		this.tableRows = [];

		const categories: { [key in CategoryName]: any[] } = {
			หมวดวิชาศึกษาทั่วไป: [],
			หมวดวิชาเฉพาะ: [],
			หมวดวิชาเสรี: [],
		};

		for (const entry of transcriptData) {
			const subjectId = entry.subjectId;
			const grade = entry.grade;
			const credit = entry.credit;
			const semester = entry.semester;
			const year = entry.year;
			const title = this.subjectTitleMap[subjectId] || '';

			let category: CategoryName = 'หมวดวิชาเสรี';

			if (subjectId.startsWith('9064')) {
				category = 'หมวดวิชาศึกษาทั่วไป';
			} else if (subjectId.startsWith('0107')) {
				category = 'หมวดวิชาเฉพาะ';
			}

			categories[category].push({
				code: subjectId,
				title: title,
				grade: grade,
				credit: credit,
				semester: semester,
				year: year,
			});
		}

		for (const [categoryName, subjects] of Object.entries(categories)) {
			const catName = categoryName as CategoryName;
			const completedCredits = subjects.reduce((sum, subj) => {
				if (subj.grade !== '0') {
					return sum + (subj.credit || 0);
				}
				return sum;
			}, 0);

			const totalCategoryCredits =
				this.categoryCreditRequirements[catName] || 0;
			const remainingCredits = totalCategoryCredits - completedCredits;

			const tableRow = {
				category: categoryName,
				completed: completedCredits,
				remaining: remainingCredits,
				subCategories: [
					{
						name: '',
						completed: completedCredits,
						remaining: remainingCredits,
						courses: subjects.map((subj) => ({
							code: subj.code,
							title: subj.title || '',
						})),
					},
				],
			};

			this.tableRows.push(tableRow);
		}

		this.updateTotals();
	}

	private updateTotals() {
		const totals = this.calculateTotals();
		this._totalCompleted = totals.totalCompleted;
	}

	private calculateTotals() {
		let totalCompleted = 0;

		for (const row of this.tableRows) {
			totalCompleted += row.completed || 0;
		}

		return { totalCompleted };
	}

	get totalCredit(): number {
		return 136;
	}

	get totalCompleted(): number {
		return this._totalCompleted;
	}

	get totalRemaining(): number {
		return this.totalCredit - this.totalCompleted;
	}
}
```

my-subject.page.ts

```
<div class="mt-4 flex justify-between">
	<p class="text-xl font-medium text-dark-100">
		หลักสูตร วิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์
		(หลักสูตรปรับปรุง พ.ศ. 2564)
	</p>
	<div class="flex gap-x-2">
		<button
			data-modal-target="confirm-delete-modal"
			data-modal-toggle="confirm-delete-modal"
			class="rounded-lg border border-red-400 bg-white px-3 py-1.5 text-base font-medium text-dark-100 hover:bg-red-400 hover:text-white focus:bg-red-400 focus:text-white"
		>
			ลบข้อมูล Transcript
		</button>
		<button
			data-modal-target="import-transcript-modal"
			data-modal-toggle="import-transcript-modal"
			class="rounded-lg bg-main-100 px-3 py-1.5 text-base font-medium text-white hover:bg-main-120"
		>
			อัปโหลด Transcript
		</button>
	</div>
</div>
<sdm-confirm-delete-modal
	modalID="confirm-delete-modal"
	text="คุณต้องการลบข้อมูล Transcript ใช่หรือไม่?"
	subtext="*หากลบแล้วจะไม่สามารถกู้คืนได้ ต้องอัปโหลดใหม่เท่านั้น"
	[haveTranscriptData]="haveTranscriptData"
></sdm-confirm-delete-modal>
<sdm-import-transcript-modal
	modalID="import-transcript-modal"
	headerModal="อัปโหลดไฟล์ Transcript ของคุณ"
></sdm-import-transcript-modal>
<div class="mt-9 flex gap-x-6">
	<sdm-table
		[listThead]="tableHeaders"
		[tableData]="tableRows"
		[totalCompleted]="totalCompleted"
		[totalRemaining]="totalRemaining"
		class="w-[1168px]"
	></sdm-table>
	<div class="flex flex-col gap-y-6">
		<sdm-credit-dashboard
			[totalCompleted]="totalCompleted"
			[totalRemaining]="totalRemaining"
			[totalCredit]="totalCredit"
			class="w-[325px]"
		></sdm-credit-dashboard>
		<sdm-advice-dashboard class="w-[325px]"></sdm-advice-dashboard>
	</div>
</div>
```

my-subject.page.html

FYI current setup is based on checking subject's leading number which is not ideal, I want to check database and using the API to check that.

To make it work you need to do
Each user have their own curriculum selected, Here is the user structure and curriculum structure

```
import { Curriculum } from './Curriculum.model';

export class User {
	constructor(
		public id: string,
		public password: string,
		public name_nick: string,
		public name_first: string,
		public name_last: string,
		public profile: string,
		public curriculum: Curriculum,
	) {}
}
```

```
export class Curriculum {
	constructor(
		public id: number,
		public unique_id: string,
		public year: string,
		public name_th: string,
		public name_en: string,
		public degree_name_th: string,
		public degree_name_th_short: string,
		public degree_name_en: string,
		public degree_name_en_short: string,
	) {}
}
```

Here you can see curriculum is in the user, so we need to use currculum to sort user's subject by

-   Each Curriculum will have curriculum groups
-   Each curriculum groups will have curriculum subgroups
-   Each curriculum subgroups will have curriculum subject
-   And finally each curriculum subject will tell you which subject it belong to in that subgroup

Here is the structure for all of that

```
namespace studymate_backend.Libraries.Models;

public class CurriculumGroup(
    int categoryId,
    int groupId,
    string curriculumId,
    string year,
    string groupName,
    int credit1,
    int credit2,
    string subgroupFlag,
    string condition,
    string link
) : IBaseModel
{
    public int categoryId { get; set; } = categoryId;
    public int groupId { get; set; } = groupId;
    public string curriculumId { get; set; } = curriculumId;
    public string year { get; set; } = year;
    public string groupName { get; set; } = groupName;
    public int credit1 { get; set; } = credit1;
    public int credit2 { get; set; } = credit2;
    public string subgroupFlag { get; set; } = subgroupFlag;
    public string condition { get; set; } = condition;
    public string link { get; set; } = link;
}
```

```
namespace studymate_backend.Libraries.Models;

public class CurriculumSubgroup(
    int categoryId,
    int groupId,
    int subgroupId,
    string uniqueId,
    string year,
    string subgroupName,
    int credit1,
    int credit2,
    string condition,
    string link
) : IBaseModel
{
    public int categoryId { get; set; } = categoryId;
    public int groupId { get; set; } = groupId;
    public int subgroupId { get; set; } = subgroupId;
    public string uniqueId { get; set; } = uniqueId;
    public string year { get; set; } = year;
    public string subgroupName { get; set; } = subgroupName;
    public int credit1 { get; set; } = credit1;
    public int credit2 { get; set; } = credit2;
    public string condition { get; set; } = condition;
    public string link { get; set; } = link;
}
```

```
namespace studymate_backend.Libraries.Models;

public class CurriculumSubject(
    string subject_id,
    int c_cat_id,
    int c_group_id,
    int c_subgroup_id,
    string unique_id,
    string year,
    string normal_flag,
    string coop_flag
) : IBaseModel
{
    public string subject_id { get; set; } = subject_id;
    public int c_cat_id { get; set; } = c_cat_id;
    public int c_group_id { get; set; } = c_group_id;
    public int c_subgroup_id { get; set; } = c_subgroup_id;
    public string unique_id { get; set; } = unique_id;
    public string year { get; set; } = year;
    public string normal_flag { get; set; } = normal_flag;
    public string coop_flag { get; set; } = coop_flag;
}
```

```
using studymate_backend.Libraries.Helper;

namespace studymate_backend.Libraries.Models;

public class Subject(
    string id,
    string subject_tname,
    string subject_ename,
    int credit,
    int lect_hr,
    int prac_hr,
    string prerequisite,
    string detail,
    int self_hr,
    string prerequisite2,
    int lock_ed,
    int precondition,
    string status,
    string subject_type,
    string prerequisite3,
    string prerequisite4,
    string prerequisite5,
    SdmDateTime last_modified
) : IBaseModel
{
    public string id { get; set; } = id;
    public string subject_tname { get; set; } = subject_tname;
    public string subject_ename { get; set; } = subject_ename;
    public int credit { get; set; } = credit;
    public int lect_hr { get; set; } = lect_hr;
    public int prac_hr { get; set; } = prac_hr;
    public string prerequisite { get; set; } = prerequisite;
    public string detail { get; set; } = detail;
    public int self_hr { get; set; } = self_hr;
    public string prerequisite2 { get; set; } = prerequisite2;
    public int lock_ed { get; set; } = lock_ed;
    public int precondition { get; set; } = precondition;
    public string status { get; set; } = status;
    public string subject_type { get; set; } = subject_type;
    public string prerequisite3 { get; set; } = prerequisite3;
    public string prerequisite4 { get; set; } = prerequisite4;
    public string prerequisite5 { get; set; } = prerequisite5;
    public SdmDateTime last_modified { get; set; } = last_modified;
}
```

As you can see I gave you the c# model since I didn't make it to the typescript yet but in the typescript model it will be snake case

Here is the list of working API right now,

-   /api/curriculum/get/{uniqueId}/{year}
-   /api/curriculum-group/get/{categoryId}/{groupId}/{uniqueId}/{year}
-   /api/curriculum-subgroup/get/{categoryId}/{groupId}/{subgroupId}/{uniqueId}/{year}
-   /api/curriculum-subject/get/{categoryId}/{groupId}/{subgroupId}/{uniqueId}/{year}
-   /api/subject/get/{subjectId}

Now to sort the subject you need to get subject from transcriptData which will contain subject Id and grade and credit etc.

```
import { Subject } from './Subject.model';
import { Transcript } from './Transcript.model';

export class TranscriptData {
	constructor(
		public id: number,
		public semester: number,
		public year: number,
		public grade: string,
		public credit: number,
		public transcript?: Transcript,
		public subject?: Subject,
	) {}
}
```

```
import { Curriculum } from './Curriculum.model';
import { User } from './User.model';

export class Transcript {
	constructor(
		public id: number,
		public created: string,
		public user?: User,
		public curriculum?: Curriculum,
	) {}
}
```

So you need to fetch transcriptData first by user, and then fetch all the remaining data and sort transcript data for user to see if they have study enouch credit for each group or not give it a go and please give only code, and you can ask me for more api if they're not enough
