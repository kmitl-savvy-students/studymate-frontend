import { TemplateRef } from '@angular/core';

export class Tabs {
	constructor(
		public id: string,
		public icon: string,
		public tab_name: string,
		public templateRef?: TemplateRef<any>, // เพิ่ม property นี้
	) {}
}
