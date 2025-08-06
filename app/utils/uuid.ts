/**
 * Standard UUID v4 validation regex pattern
 * Validates UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidUUID = (value: string): boolean => {
	return UUID_REGEX.test(value);
};

export const parseUsernameOrUUID = (value: string) => {
	return {
		value,
		isUUID: isValidUUID(value),
		isUsername: !isValidUUID(value),
	};
};
