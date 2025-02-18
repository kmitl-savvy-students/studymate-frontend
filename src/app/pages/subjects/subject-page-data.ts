import { DropdownList } from '../../shared/models/SdmAppService.model.js';

export const yearsList: DropdownList[] = Array.from({ length: 5 }, (_, i) => {
	const year = new Date().getFullYear() + 543 - i; // แปลงปี ค.ศ. เป็น พ.ศ.
	return { value: year, label: `ปีการศึกษา ${year}` };
});

export const semesterList: DropdownList[] = [
	{ value: 1, label: 'เทอม 1' },
	{ value: 2, label: 'เทอม 2' },
	{ value: 3, label: 'เทอม 3' },
];

export const classYearList: DropdownList[] = [
	{ value: 0, label: 'ทุกชั้นปี' },
	{ value: 1, label: 'ปี 1' },
	{ value: 2, label: 'ปี 2' },
	{ value: 3, label: 'ปี 3' },
	{ value: 4, label: 'ปี 4' },
];

export const subjects_added = [
	{
		code: '01076149',
		name: 'CHARM SCHOOL',
		credits: 3,
		isSelected: false,
	},
	{
		code: '01076016',
		name: 'COMPUTER ENGINEERING PROJECT PREPARATION',
		credits: 2,
		isSelected: false,
	},
	{
		code: '01076032',
		name: 'ELEMENTARY DIFFERENTIAL EQUATIONS AND LINEAR ALGEBRA',
		credits: 3,
		isSelected: false,
	},
	{
		code: '01076149',
		name: 'CHARM SCHOOL',
		credits: 3,
		isSelected: false,
	},
	{
		code: '01076149',
		name: 'CHARM SCHOOL',
		credits: 3,
		isSelected: false,
	},
	{
		code: '01076149',
		name: 'CHARM SCHOOL',
		credits: 3,
		isSelected: false,
	},
	{
		code: '01076149',
		name: 'CHARM SCHOOL',
		credits: 3,
		isSelected: false,
	},
	{
		code: '01076149',
		name: 'CHARM SCHOOL',
		credits: 3,
		isSelected: false,
	},
	{
		code: '01076149',
		name: 'CHARM SCHOOL',
		credits: 3,
		isSelected: false,
	},
	{
		code: '01076149',
		name: 'CHARM SCHOOL',
		credits: 3,
		isSelected: false,
	},
];
