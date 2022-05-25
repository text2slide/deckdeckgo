export interface GetAllRtData {
	decksModel: DecksWithSlidesModel[];
	jwttoken: string;
}
export interface DecksWithSlidesModel {
	id: string;
	data: DecksDataModel;
	slide: SlidesModel;
}

export interface DecksModel {
	id: string;
	data: DecksDataModel;
}

export interface DecksDataModel {
	name: string;
	owner_id: string;
	created_at;
	updated_at;
	slides: string[];
}

export interface SlidesModel {
	id: string;
	data: SlidesDataModel;
}

export interface SlidesDataModel {
	template: string;
	content: string;
	update_at;
	attributes: string;
}
