

export const calcRelativeSize = (
	container: HTMLDivElement,
	defaultValue: number
) => {
	return container
		? (container.clientWidth + 64) / (720 / defaultValue)
		: defaultValue;
};


