// import { CommonModule } from '@angular/common';
// import { AfterContentInit, Component, ContentChildren, Input, QueryList, TemplateRef } from '@angular/core';
// import { Tabs } from '@models/Tabs.model.js';
// import { IconComponent } from '../icon/icon.component';

// @Component({
// 	selector: 'sdm-tabs',
// 	templateUrl: './tabs.component.html',
// 	imports: [IconComponent, CommonModule],
// })
// export class SDMTabsComponent implements AfterContentInit {
// 	@Input() tabs: Tabs[] = [];
// 	@ContentChildren(TemplateRef) templates!: QueryList<TemplateRef<Tabs>>;
// 	public tabTemplates = new Map<string, TemplateRef<Tabs>>();
// 	public selectedTab: string = '';

// 	ngAfterContentInit() {
// 		this.templates.forEach((template, index) => {
// 			const tabId = this.tabs[index]?.id;
// 			if (tabId && template) {
// 				this.tabTemplates.set(tabId, template);
// 			}
// 		});
// 		if (this.tabs.length > 0) {
// 			this.selectedTab = this.tabs[0].id;
// 		}
// 		if (this.tabs.length > 0) {
// 			this.selectedTab = this.tabs[0].id;
// 		}
// 	}

// 	selectTab(tabId: string) {
// 		this.selectedTab = tabId;
// 	}
// }

import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ContentChildren, Input, QueryList, TemplateRef } from '@angular/core';
import { Tabs } from '@models/Tabs.model.js';
import { IconComponent } from '../icon/icon.component';

@Component({
	selector: 'sdm-tabs',
	templateUrl: './tabs.component.html',
	imports: [IconComponent, CommonModule],
})
export class SDMTabsComponent implements AfterContentInit {
	@Input() tabs: Tabs[] = [];
	@ContentChildren(TemplateRef) templates!: QueryList<TemplateRef<any>>;
	public selectedTab: string = '';

	ngAfterContentInit() {
		this.templates.forEach((template, index) => {
			if (this.tabs[index]) {
				this.tabs[index].templateRef = template;
			}
		});
		if (this.tabs.length > 0) {
			this.selectedTab = this.tabs[0].id;
		}
	}

	selectTab(tabId: string) {
		this.selectedTab = tabId;
	}
}
