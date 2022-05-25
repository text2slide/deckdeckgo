import { keys, set } from 'idb-keyval';

import { StorageFile, StorageFilesList } from '@deckdeckgo/editor';

import store from '../../stores/error.store';
import { encodeFilename } from '../../utils/editor/image.utils';
import {
	GetFileListRt,
	UserFileList,
	UserFileModel,
} from '../../types/core/userData';
import {
	fetchData,
	getUserId,
	getUuidApi,
	saveUploadDataApi,
} from '../../utils/core/api.utils';
import { ApiUrls } from '../../types/core/apiUrls';

export class StorageOfflineProvider {
	private static instance: StorageOfflineProvider;

	private constructor() {
		// Private constructor, singleton
	}

	static getInstance() {
		if (!StorageOfflineProvider.instance) {
			StorageOfflineProvider.instance = new StorageOfflineProvider();
		}
		return StorageOfflineProvider.instance;
	}

	uploadFile(
		data: File,
		folder: string,
		maxSize: number
	): Promise<StorageFile | undefined> {
		return new Promise<StorageFile>(async (resolve) => {
			try {
				if (!data || !data.name) {
					store.state.error = 'File not valid.';
					resolve(undefined);
					return;
				}

				if (data.size > maxSize) {
					store.state.error = `File is too big (max. ${maxSize / 5242880} Mb)`;
					resolve(undefined);
					return;
				}

				const key: string = `/assets/local/${folder}/${encodeFilename(data)}`;

				await set(key, data);

				resolve({
					downloadUrl: key,
					fullPath: key,
					name: data.name,
				});
			} catch (err) {
				// store.state.error = 'File could not be saved.';
				resolve(undefined);
			}
		});
	}

	getFiles(folder: string): Promise<StorageFilesList | null> {
		return new Promise<StorageFilesList | null>(async (resolve) => {
			const storageKeys: IDBValidKey[] = await keys();

			if (!storageKeys || storageKeys.length <= 0) {
				resolve(null);
				return;
			}

			const filteredKeys: IDBValidKey[] = storageKeys.filter(
				(key: IDBValidKey) => {
					return (key as string).indexOf(`/assets/local/${folder}/`) > -1;
				}
			);

			if (!filteredKeys || filteredKeys.length <= 0) {
				resolve(null);
				return;
			}

			const items: StorageFile[] = filteredKeys.map((key: IDBValidKey) => {
				return {
					downloadUrl: key,
					fullPath: key,
					name: key,
				} as StorageFile;
			});

			resolve({
				items,
				nextPageToken: undefined,
			});
		});
	}
}