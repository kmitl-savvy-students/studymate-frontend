import { TranscriptDetail } from './TranscriptDetail.model';
import { User } from './User.model';

export class Transcript {
	constructor(
		public id: number,
		public user: User | null,
		public date_created: string,
		public details: Array<TranscriptDetail>,
	) {}
}
