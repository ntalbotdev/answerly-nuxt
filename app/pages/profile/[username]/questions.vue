<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const username = route.params.username as string;
const { loading, error, profile, fetchUserProfile, fetchQuestions } =
	useProfilePage(username);

const questions = ref<any[]>([]);
const questionsLoading = ref(false);
const questionsError = ref("");

useHead({
	title: `Questions for ${username}`,
	meta: [
		{ name: "description", content: "View questions asked to this user." },
	],
});

onMounted(async () => {
	const profileData = await fetchUserProfile();
	if (profileData) {
		await loadQuestions();
	}
});

async function loadQuestions() {
	questionsLoading.value = true;
	questionsError.value = "";

	try {
		questions.value = await fetchQuestions();
	} catch (err) {
		questionsError.value = (err as Error).message;
	} finally {
		questionsLoading.value = false;
	}
}

function goToAsk() {
	router.push(`/ask/${username}`);
}
</script>

<template>
	<div class="questions-page">
		<LoadingError
			:loading="loading"
			:error="error"
			loading-text="Loading profile..."
		>
			<div v-if="profile">
				<div class="questions-header">
					<h1 class="page-title">
						Questions for
						{{ profile.display_name || profile.username }}
					</h1>
					<button @click="goToAsk" class="ask-button">
						Ask {{ profile.display_name || profile.username }} a
						question
					</button>
				</div>

				<LoadingError
					:loading="questionsLoading"
					:error="questionsError"
					:show-empty-state="questions.length === 0"
					empty-state="No questions yet."
					loading-text="Loading questions..."
				>
					<div class="questions-list">
						<div
							v-for="q in questions"
							:key="q.id"
							class="question-item"
						>
							<div class="question-content">
								<div class="question-text">
									<strong>Q:</strong> {{ q.question }}
								</div>

								<div class="question-meta">
									Asked by
									<template v-if="q.is_anonymous">
										<strong>Anonymous</strong>
									</template>
									<template v-else-if="q.profiles">
										<ProfileCard
											:profile="q.profiles"
											:show-bio="false"
											size="small"
										/>
									</template>
									<template v-else>
										<span>Unknown</span>
									</template>
									on
									{{
										new Date(q.created_at).toLocaleString()
									}}
								</div>
							</div>

							<div class="answer-content">
								<div
									v-if="q.answer && q.answer.trim() !== ''"
									class="answer-text"
								>
									<strong>A:</strong> {{ q.answer }}
								</div>
								<div v-else class="no-answer">
									<em>No answer yet.</em>
								</div>
							</div>
						</div>
					</div>
				</LoadingError>
			</div>
		</LoadingError>
	</div>
</template>

<style scoped>
.questions-page {
	@apply mx-auto max-w-4xl p-6;
}

.questions-header {
	@apply mb-6 flex items-center justify-between;
}

.page-title {
	@apply text-2xl font-bold text-gray-900;
}

.ask-button {
	@apply rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700;
}

.questions-list {
	@apply space-y-6;
}

.question-item {
	@apply rounded-lg border border-gray-200 bg-white p-6 shadow-sm;
}

.question-content {
	@apply mb-4;
}

.question-text {
	@apply mb-2 text-lg;
}

.question-meta {
	@apply flex items-center gap-2 text-sm text-gray-600;
}

.answer-content {
	@apply border-t border-gray-100 pt-4;
}

.answer-text {
	@apply text-gray-800;
}

.no-answer {
	@apply text-gray-500;
}
</style>
