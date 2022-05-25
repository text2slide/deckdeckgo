import { StorageFile } from '@deckdeckgo/editor';

export interface UserFileModel {
	FileId: string;
	userId: string;
	type: string;
	path: string;
	originalName: string;
	fileName: string;
}
export interface UserFileList {
	items: StorageFile[];
}

export interface GetFileListRt {
	list: UserFileModel[];
}
