import * as admin from 'firebase-admin';

import {v4 as uuid} from 'uuid';

import {Deck} from '../../../model/data/deck';
import {Slide, SlideData} from '../../../model/data/slide';

import {MetadataSlide} from '../modal/metadata-slide';

import {createDeck as createDeckUtils, updateDeck} from '../../../utils/data/deck-utils';
import {createSlide as createSlideUtils} from '../../../utils/data/slide-utils';

const readFile = (filePath: string): Promise<string> => {
  const bucket = admin.storage().bucket();
  const stream = bucket.file(filePath).createReadStream();

  return new Promise<string>((resolve, reject) => {
    let data = '';

    stream.on('data', (chunk: string) => (data += chunk));
    stream.on('end', () => resolve(data));
    stream.on('error', (error: Error) => reject(error));
  });
};

export async function createDeck(objName: string) {
  // 7ZkPkEPNQoVq0Ysylgf2CRFusf32/assets/decks/315731ce-0cf7-479e-8496-3d3015118e47/meta.json
  const split: string[] = objName.split('/');

  const userId: string | undefined = split?.[0];
  const tmpId: string | undefined = split?.[3];

  if (!userId || !tmpId) {
    return;
  }

  const metaContent: string = await readFile(objName);

  if (!metaContent) {
    return;
  }

  const metaList: MetadataSlide[] = JSON.parse(metaContent);

  if (!metaList || metaList.length <= 0) {
    return;
  }

  const deck: Deck = await createDeckUtils(userId);

  const promises: Promise<string>[] = metaList.map((meta: MetadataSlide) => createSlide(deck, meta, userId, tmpId));
  const slides: string[] = await Promise.all(promises);

  await updateDeck(deck.id, {
    ...deck.data,
    slides,
  });

  await cleanStorageMeta(userId, tmpId);
}

const createSlide = async (deck: Deck, meta: MetadataSlide, userId: string, tmpId: string): Promise<string> => {
  const downloadUrl: string = await generateDownloadUrl(meta, userId, tmpId);

  const content: string | undefined = meta.text ? await readFile(`${userId}/assets/decks/${tmpId}/${meta.text}`) : undefined;

  const slideData: SlideData = {
    template: 'svg',
    ...(content && {content}),
    ...(downloadUrl && {
      attributes: {
        svgSrc: downloadUrl,
      },
    }),
  };

  const slide: Slide = await createSlideUtils(deck.id, slideData);

  await cleanStorageText(meta, userId, tmpId);

  return slide.id;
};

const cleanStorageText = async (meta: MetadataSlide, userId: string, tmpId: string) => {
  if (!meta.text) {
    return;
  }

  const tmpPath: string = `${userId}/assets/decks/${tmpId}/${meta.text}`;

  const bucket = admin.storage().bucket();
  const folder = bucket.file(tmpPath);

  await folder.delete();
};

// Remove temp folder which only contains meta.json
const cleanStorageMeta = async (userId: string, tmpId: string) => {
  const tmpPath: string = `${userId}/assets/decks/${tmpId}/meta.json`;

  const bucket = admin.storage().bucket();
  const folder = bucket.file(tmpPath);

  await folder.delete();
};

// https://www.sentinelstand.com/article/guide-to-firebase-storage-download-urls-tokens
const generateDownloadUrl = async (meta: MetadataSlide, userId: string, tmpId: string): Promise<string> => {
  const bucket = admin.storage().bucket();

  const path: string = `${userId}/assets/images/${tmpId}/${meta.background}`;

  const file = bucket.file(path);

  const downloadToken: string = uuid();

  await file.setMetadata({
    metadata: {
      firebaseStorageDownloadTokens: downloadToken,
    },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`;
};
