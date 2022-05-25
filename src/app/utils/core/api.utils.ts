/* *NOTE* API settings and functions here */
import { EnvironmentConfigService } from '../../services/environment/environment-config.service';
import errorStore from '../../stores/error.store';
import { ApiUrls } from '../../types/core/apiUrls';
import { EnvironmentDeckDeckGoConfig } from '../../types/core/environment-config';
import { LocalStorageKeys } from '../../types/core/localStorageKeys';
import { base64Decode, base64Encode } from './string.utils';

// get user
export const getUserId = () => {
	const userId = localStorage.getItem(LocalStorageKeys.userData)
		? JSON.parse(localStorage.getItem(LocalStorageKeys.userData)).userId
		: (errorStore.state.error = 'Please Login First');

	return userId;
};

export const getUserEmail = () => {
	const userEmail = localStorage.getItem(LocalStorageKeys.userData)
		? JSON.parse(localStorage.getItem(LocalStorageKeys.userData)).emailAddress
		: (errorStore.state.error = 'Please Login First');

	return userEmail;
};

export const initialDeckId = () => {
	const deckId = localStorage.getItem(LocalStorageKeys.aiClerkRt)
		? JSON.parse(localStorage.getItem(LocalStorageKeys.aiClerkRt)).decksModel.id
		: '';

	console.log(`initialDeckId from aiClerkRt: ${deckId}`);

	return deckId;
};

export const getUserLoginType = () => {
	const loginType = localStorage.getItem(LocalStorageKeys.userData)
		? JSON.parse(localStorage.getItem(LocalStorageKeys.userData)).loginType
		: (errorStore.state.error = 'Please Login First');

	return loginType;
};

// getJWTToken
export const getJWTToken = () => {
	const jwttoken = localStorage.getItem(LocalStorageKeys.userData)
		? JSON.parse(localStorage.getItem(LocalStorageKeys.userData)).jwttoken
		: (errorStore.state.error = 'Please Login First');

	return jwttoken;
};

const setHeader = () => {
	const jwttoken = getJWTToken();
	const header = new Headers();
	header.append('Content-Type', 'application/json');
	header.append('Authorization', `Bearer ${jwttoken}`);

	return header;
};

/* API to call */
// fetch
export const fetchData = async (apiPath: string, requestBody?: object) => {
	const apiUrl = `https://www.jgallop.com/ppback${apiPath}`;
	let requestOptions = {};

	// setup header
	const jwttoken = getJWTToken();
	const header = new Headers();
	header.append('Content-Type', 'application/json');
	header.append('Authorization', `Bearer ${jwttoken}`);

	// setup body (if having one)
	if (apiPath !== '/getAllDeck') {
		const data = JSON.stringify(requestBody);
		const raw = base64Encode(data);

		requestOptions = {
			method: 'POST',
			headers: header,
			body: raw,
			redirect: 'follow' as RequestRedirect,
		};

		console.log(`request:`, {
			apiPath,
			req: { jwtToken: getJWTToken(), data },
		});
	} else {
		requestOptions = {
			method: 'POST',
			headers: header,
			redirect: 'follow' as RequestRedirect,
		};

		console.log(`request:`, { apiPath, req: { jwtToken: getJWTToken() } });
	}

	const res = await fetch(apiUrl, requestOptions);
	const resDataText = await res.text();
	const resDataJSON = JSON.parse(resDataText);
	if (resDataJSON.rtCode === 'RT_SUCCESSFUL') {
		const rtData = resDataJSON.rtData;
		const rtDataDecode = base64Decode(rtData); // decode rtData from base 64

		console.log(`raw response: ${apiPath} `, {
			status: resDataJSON.rtCode,
			data: JSON.parse(rtDataDecode),
		});

		return JSON.parse(rtDataDecode);
	} else if (resDataJSON.rtCode === 'RT_ERROR_VERIFY_FAIL') {
		reLogin();
	} else {
		console.log(`raw response: ${apiPath} `, {
			status: resDataJSON.rtCode,
			message: resDataJSON.rtMsg,
		});
		errorStore.state.error = `Something went wrong. ${resDataJSON.rtCode}: ${resDataJSON.rtMsg}`;
	}
}; // fetchData

export const syncDataApi = async (apiPath: string, requestBody: object) => {
	console.log(`ApiUtils syncDataApi`);
	const apiUrl = `https://www.jgallop.com/ppback${apiPath}`;
	// let requestOptions = {};

	// setup header
	const jwttoken = getJWTToken();
	const header = new Headers();
	header.append('Content-Type', 'application/json');
	header.append('Authorization', `Bearer ${jwttoken}`);

	const data = JSON.stringify(requestBody);
	const raw = base64Encode(data);

	const requestOptions = {
		method: 'POST',
		headers: header,
		body: raw,
		redirect: 'follow' as RequestRedirect,
	};

	console.log(`request:`, {
		apiPath,
		req: { jwtToken: getJWTToken(), data },
	});

	const res = await fetch(apiUrl, requestOptions);
	const resDataText = await res.text();
	const resDataJSON = JSON.parse(resDataText);
	if (resDataJSON.rtCode === 'RT_SUCCESSFUL') {
		const rtData = resDataJSON.rtData;
		const rtDataDecode = base64Decode(rtData); // decode rtData from base 64

		console.log(`raw response: ${apiPath} `, {
			status: resDataJSON.rtCode,
			data: JSON.parse(rtDataDecode),
		});

		const rtJsonDataDecode = {
			rtCode: resDataJSON.rtCode,
			rtData: JSON.parse(rtDataDecode),
		};

		return rtJsonDataDecode;
	} else if (resDataJSON.rtCode === 'RT_ERROR_VERIFY_FAIL') {
		reLogin();
	} else {
		console.log(`raw response: ${apiPath} `, {
			status: resDataJSON.rtCode,
			message: resDataJSON.rtMsg,
		});
		// errorStore.state.error = `Something went wrong. ${resDataJSON.rtCode}: ${resDataJSON.rtMsg}`;
	}
}; // syncDataApi

export const saveUploadDataApi = async (apiPath, formData: FormData) => {
	const apiUrl = `https://www.jgallop.com/ppback${apiPath}`;
	// setup header
	const jwttoken = getJWTToken();
	const header = new Headers();
	// header.append('Content-Type', 'application/json');
	header.append('Authorization', `Bearer ${jwttoken}`);

	const requestOptions = {
		method: 'POST',
		headers: header,
		body: formData,
	};

	console.log(`/saveUploadData request:`, {
		apiPath,
		req: { requestOptions },
	});

	// fetch
	const rtSaveUploadData = await fetch(apiUrl, requestOptions);
	const rtJson = await rtSaveUploadData.json();

	console.log(`/saveUploadData res:`, {
		apiUrl,
		res: { rtJson },
	});

	if (rtJson.rtCode === 'RT_SUCCESSFUL') {
		const rtData = rtJson.rtData;

		const rtDataDecode = base64Decode(rtData);

		console.log(`raw response: ${apiPath} `, {
			status: rtJson.rtCode,
			data: JSON.parse(rtDataDecode),
		});

		return JSON.parse(rtDataDecode);
	} else if (rtJson.rtCode === 'RT_ERROR_VERIFY_FAIL') {
		reLogin();
	} else {
		console.log(`raw response: ${apiPath} `, {
			status: rtJson.rtCode,
			message: rtJson.rtMsg,
		});
	}
}; // saveUploadDataApi

export const getUuidApi = (numbers: number) => {
	const apiPath = ApiUrls.getUuid;
	const apiUrl = `https://www.jgallop.com/ppback${apiPath}`;
	const header = setHeader();
	const data = JSON.stringify({
		numbers: numbers,
	});

	const raw = base64Encode(data);

	const requestOptions = {
		method: 'POST',
		headers: header,
		body: raw,
		redirect: 'follow' as RequestRedirect,
	};

	console.log(`request:`, { apiPath, req: { jwtToken: getJWTToken(), data } });

	fetch(apiUrl, requestOptions)
		.then((response) => response.text())
		.then((result) => {
			const localJsonData = JSON.parse(result);
			console.log('response: ', {
				status: JSON.stringify(localJsonData.rtCode),
				data: JSON.stringify(localJsonData.rtData),
			});

			if (localJsonData.rtCode === 'RT_SUCCESSFUL') {
				// success: return uuid list[numbers]
				const rtDataDecode = JSON.parse(base64Decode(localJsonData.rtData));
				const idList = rtDataDecode.idList;
				return idList;
			} else if (localJsonData.rtCode === 'RT_ERROR_VERIFY_FAIL') {
				reLogin();
			}
		});
}; // getUuidApi

export const transferToObj = (
	attrString: string | undefined | null | object
): any => {
	if (attrString === '' || attrString == undefined) {
		return {};
	} else if (typeof attrString === 'string') {
		// to avoid multiple JSON.stringify
		while (typeof attrString === 'string') {
			attrString = JSON.parse(attrString);
		}
		return attrString;
	} else {
		return attrString;
	}
};

export const modifySlideContent = (contentString: string): string => {
	return contentString
		.replace(/<!--.*>/gm, '')
		.replace(/(\r\n|\n|\r)/gm, '')
		.replace(/(\r\n|\t)/gm, ' ');
};

export const reLogin = () => {
	// const config: EnvironmentDeckDeckGoConfig =
	// 	EnvironmentConfigService.getInstance().get('deckdeckgo');
	// console.log(`ApiUtils reLogin(): delayTime:`, config.delayTime);
	// setTimeout(() => {
	// 	navStore.state.nav = {
	// 		url: config.navigateLoginUrl,
	// 		direction: NavDirection.RELOAD,
	// 	};
	// }, config.delayTime);
};
