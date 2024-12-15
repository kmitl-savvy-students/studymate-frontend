export class SelectedData {
	public label!: string
	public index?: number;
    public value? : any
}

export class DropdownList{
    public label!: string;
    public value? : string|number
}

export class CirriculumnList{
    public value? : string|number;
    public uniqueId? : string;
    public curriculumYear? : string;
}

export class SubjectData{
    public subject_id!: string
    public credit!: number
    public section!: number
    public subject_name_th!: string
    public subject_name_en!: string
    public subject_type_name!: string
    public subject_subtype_name!: string
    public classdatetime!: string[]
    public classbuilding!: string
    public room_no!: string
    public rule!: string
    public teacher_list_th!: string[]
    public teacher_list_en!: string[]
    public lect_or_prac!: string
    public midterm_date_time!: string[]
    public final_date_time!: string[]
}


