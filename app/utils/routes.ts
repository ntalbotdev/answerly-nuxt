export const ROUTES = {
	HOME: "/",
	PROFILE_USER: (username: string) => `/profile/${username}`,
	PROFILE_USER_FOLLOWERS: (username: string) =>
		`/profile/${username}/followers`,
	PROFILE_USER_FOLLOWING: (username: string) =>
		`/profile/${username}/following`,
	MY_QUESTIONS: "/my-questions",
	INBOX: "/inbox",
	DISCOVER: "/discover",
	NOTIFICATIONS: "/notifications",
	SETTINGS: "/settings",
	LOGIN: "/auth/login",
	SIGNUP: "/auth/signup",
	FORGOT_PASSWORD: "/auth/forgot-password",
	AUTH_CONFIRM: "/auth/confirm",
};
