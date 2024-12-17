export class BaseResponse<T> {
	constructor(
		public code: string,
		public message: string,
		public data: T,
	) {}
}
