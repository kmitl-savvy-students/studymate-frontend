// import { AfterViewInit, Component, Input } from '@angular/core';
// import { initFlowbite } from 'flowbite';
// import { IconComponent } from '../icon/icon.component';

// @Component({
// 	selector: 'sdm-tabs',
// 	imports: [IconComponent],
// 	templateUrl: './tabs.component.html',
// 	styleUrl: './tabs.component.css',
// })
// export class SDMTabsComponent implements AfterViewInit {
// 	@Input() tabs: Array<{ id: string; icon: string; tab_name: string }> = [];
// 	public activeTab: string = '';

// 	ngAfterViewInit(): void {
// 		initFlowbite();
// 	}

// 	setActiveTab(tabId: string) {
// 		this.activeTab = tabId;
// 	}
// }

// app-tab.component.ts
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
	@ContentChildren(TemplateRef) templates!: QueryList<TemplateRef<Tabs>>;
	public tabTemplates = new Map<string, TemplateRef<Tabs>>();
	public selectedTab: string = '';

	ngAfterContentInit() {
		this.templates.forEach((template, index) => {
			const tabId = this.tabs[index]?.id;
			if (tabId && template) {
				this.tabTemplates.set(tabId, template);
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
