import { config } from "@vue/test-utils";
import { vi } from "vitest";
import { ref } from "vue";

export const mockUser = ref<{
	id: string;
	email?: string;
	username?: string;
} | null>(null);

export const mockNavigateTo = vi.fn();

export const ROUTES = {
	HOME: "/",
	DISCOVER: "/discover",
	NOTIFICATIONS: "/notifications",
	LOGIN: "/auth/login",
	SIGNUP: "/auth/signup",
	INBOX: "/inbox",
	PROFILE_USER: (username = "") => `/profile/${username}`,
	MY_QUESTIONS: "/my-questions",
	SETTINGS: "/settings",
};

vi.mock("#imports", () => {
	return {
		useSupabaseUser: () => mockUser,
		useProfileStore: () => ({
			get myProfile() {
				return mockUser.value
					? {
							user_id: mockUser.value.id,
							username: mockUser.value.username || "testuser",
							display_name: "Test User",
							avatar_url: "https://example.com/avatar.png",
						}
					: null;
			},
			fetchProfileById: vi.fn(),
			clearProfile: vi.fn(),
		}),
		useNotificationsStore: () => ({
			unreadCount: 0,
		}),
		useQuestionsStore: () => ({
			hasNewInboxItems: false,
			newInboxCount: 0,
		}),
		useRoute: () => ({
			path: "/",
		}),
		ROUTES,
		navigateTo: mockNavigateTo,
	};
});

vi.mock("@/composables/useFollow", () => ({
	fetchFollowingCount: vi.fn().mockResolvedValue(17),
	fetchFollowerCount: vi.fn().mockResolvedValue(42),
}));

config.global.stubs = {
	NuxtLink: {
		template: '<a :href="to"><slot /></a>',
		props: ["to"],
	},
	HeaderNavbar: {
		template: `
			<nav data-testid="header-navbar">
				<div v-if="user" data-testid="header-user-dropdown"></div>
			</nav>
		`,
		setup() {
			const user = mockUser;
			return { user };
		},
	},
	HeaderUserDropdown: {
		template: '<div data-testid="header-user-dropdown"></div>',
	},
	LogoutButton: {
		template: '<button data-testid="logout-button">Logout</button>',
	},
	Icon: {
		template: "<span></span>",
		props: ["name"],
	},
};
