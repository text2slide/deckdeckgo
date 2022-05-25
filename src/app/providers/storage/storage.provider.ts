import {
	GetFiles,
	StorageFile,
	StorageFilesList,
	UploadFile,
	DeleteFile,
} from '@deckdeckgo/editor';
import { del } from 'idb-keyval';

import authStore from '../../stores/auth.store';
import offlineStore from '../../stores/offline.store';

import { StorageOfflineProvider } from './storage.offline.provider';

import { cloud } from '../../utils/core/environment.utils';
import { cloudProvider } from '../../utils/core/providers.utils';

import { Constants } from '../../types/core/constants';
import {
	// deleteFileApi,
	fetchData,
	// getFileListApi,
	// saveUploadDataApi,
} from '../../utils/core/api.utils';
import { ApiUrls } from '../../types/core/apiUrls';
import {
	GetFileListRt,
	UserFileList,
	UserFileModel,
} from '../../types/core/userData';
import errorStore from '../../stores/error.store';

export const uploadOnlineFile = async (
	data: File,
	folder: string,
	maxSize: number,
	downloadUrl?: boolean
): Promise<StorageFile | undefined> => {
	if (cloud()) {
		const { uploadFile }: { uploadFile: UploadFile } = await cloudProvider<{
			uploadFile: UploadFile;
		}>();

		return uploadFile({
			data,
			folder,
			maxSize,
			downloadUrl,
			userId: authStore.state.authUser.uid,
		});
	}

	throw new Error('No provider to upload file online.');
	// change end
};

export const getFiles = async (
	folder: string
): Promise<UserFileList | null> => {
	if (!authStore.state.loggedIn || !offlineStore.state.online) {
		return StorageOfflineProvider.getInstance().getFiles(folder);
	}

	return StorageOfflineProvider.getInstance().getFiles(folder);
	// change end
};

export const deleteFile = async (storageFile: StorageFile) => {
	if (cloud()) {
		const { deleteFile }: { deleteFile: DeleteFile } = await cloudProvider<{
			deleteFile: DeleteFile;
		}>();

		return deleteFile(storageFile);
	}
	throw new Error('No provider to delete online file.');
};
