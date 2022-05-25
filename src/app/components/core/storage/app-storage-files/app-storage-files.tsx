import {
	Component,
	ComponentInterface,
	EventEmitter,
	h,
	Host,
	State,
	Event,
	Prop,
	Watch,
	Method,
} from '@stencil/core';

import { AuthUser, StorageFile, StorageFilesList } from '@deckdeckgo/editor';

import store from '../../../../stores/error.store';
import i18n from '../../../../stores/i18n.store';

import { Constants } from '../../../../types/core/constants';

import { getFiles } from '../../../../providers/storage/storage.provider';
import authStore from '../../../../stores/auth.store';
import { UserFileList, UserFileModel } from '../../../../types/core/userData';
import { folder } from 'jszip';
import { ApiUrls } from '../../../../types/core/apiUrls';
import { fetchData } from '../../../../utils/core/api.utils';

@Component({
	tag: 'app-storage-files',
	styleUrl: 'app-storage-files.scss',
})
export class AppStorageFiles implements ComponentInterface {
	private paginationNext: string | null;

	@Prop()
	folder!: 'data' | 'images';

	@Prop()
	admin: boolean = false;

	@State()
	private loading: boolean = true;

	@State()
	private disableInfiniteScroll = false;

	@State()
	private files: StorageFile[] = [];

	@Event()
	selectAsset: EventEmitter<StorageFile>;

	private destroyListener;

	async componentDidLoad() {
		this.destroyListener = authStore.onChange(
			'authUser',
			async (_authUser: AuthUser | null) => {
				await this.search();
			}
		);

		await this.search();
	}

	disconnectedCallback() {
		this.destroyListener?.();
	}

	@Watch('folder')
	async onFolderChange() {
		await this.resetAndSearch();
	}

	@Method()
	async resetAndSearch() {
		this.disableInfiniteScroll = false;
		this.files = [];
		this.loading = true;

		await this.search();
	}

	private async search() {
		if (!authStore.state.loggedIn) {
			return;
		}

		const { items }: UserFileList = await this.loadFiles();

		this.files = [...items]; // *NOTE* prevent file re-appear
		// this.paginationNext = nextPageToken;

		this.disableInfiniteScroll =
			items.length < Constants.STORAGE.MAX_QUERY_RESULTS - 1 ||
			!this.paginationNext;

		this.loading = false;
	}

	private async loadFiles(): Promise<UserFileList> {
		try {
			const list: UserFileList = await getFiles(this.folder);

			if (!list || !list.items || list.items.length <= 0) {
				return {
					items: [],
					// nextPageToken: null,
				};
			}

			return list;
		} catch (err) {
			store.state.error = 'Storage files cannot be loaded.';
			return {
				items: [],
				// nextPageToken: null,
			};
		}
	}

	private async searchNext($event: CustomEvent<void>) {
		await this.search();

		await ($event.target as HTMLIonInfiniteScrollElement).complete();
	}

	private async removeStorageFile({ detail }: CustomEvent<string>) {
		this.files = [
			...this.files.filter(({ fullPath }: StorageFile) => fullPath !== detail),
		];

		await this.resetAndSearch();
	}

	render() {
		return (
			<Host>
				{this.renderContent()}

				<ion-infinite-scroll
					threshold='100px'
					disabled={this.disableInfiniteScroll}
					onIonInfinite={async ($event: CustomEvent<void>) =>
						await this.searchNext($event)
					}>
					<ion-infinite-scroll-content
						loadingText={i18n.state.core.loading}></ion-infinite-scroll-content>
				</ion-infinite-scroll>
			</Host>
		);
	}

	private renderContent() {
		if (!this.files || this.files.length <= 0) {
			return this.renderPlaceHolder();
		}

		return this.renderFiles();
	}

	private renderPlaceHolder() {
		if (this.loading) {
			return undefined;
		}

		return (
			<ion-label class='empty'>
				{i18n.state.editor.your_collection_empty}
			</ion-label>
		);
	}

	private renderFiles() {
		return this.files.map((storageFile: StorageFile, index: number) => {
			return this.renderFile(storageFile, index);
		});
	}

	private renderFile(storageFile: StorageFile, index: number) {
		if (this.folder === 'images') {
			return (
				<article
					custom-tappable
					onClick={() => this.selectAsset.emit(storageFile)}
					key={`file-${index}`}>
					<app-asset-image image={storageFile}></app-asset-image>

					{this.admin && (
						<app-storage-admin
							storageFile={storageFile}
							onFileDeleted={async ($event: CustomEvent<string>) =>
								await this.removeStorageFile($event)
							}></app-storage-admin>
					)}
				</article>
			);
		}

		return (
			<article
				custom-tappable
				class='data'
				onClick={() => this.selectAsset.emit(storageFile)}
				key={`file-${index}`}>
				<app-asset-data data={storageFile}></app-asset-data>

				{this.admin && (
					<app-storage-admin
						storageFile={storageFile}
						onFileDeleted={async ($event: CustomEvent<string>) =>
							await this.removeStorageFile($event)
						}></app-storage-admin>
				)}
			</article>
		);
	}
}