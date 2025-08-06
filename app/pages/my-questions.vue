<script setup lang="ts">
const questionsStore = useQuestionsStore();
const questions = ref<(Question & { to_username?: string })[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

definePageMeta({
	middleware: "auth",
});

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleString();
}

async function fetchUserAskedQuestions() {
	loading.value = true;
	error.value = null;
	try {
		const res = await fetchAskedQuestions();
		questions.value = res;
	} catch (err: unknown) {
		if (err instanceof Error) {
			error.value = err.message || "Failed to load questions.";
		} else {
			error.value = "Failed to load questions.";
		}
	} finally {
		loading.value = false;
	}
}
onMounted(fetchUserAskedQuestions);

useHead({
	title: "Questions I Asked",
	meta: [
		{ name: "description", content: "View the questions you have asked." },
	],
});
</script>

<template>
	<div class="section my-questions">
		<h2 class="section__title my-questions__title">Questions I Asked</h2>

		<LoadingError
			:loading="loading"
			:error="error || ''"
			:show-empty-state="questions.length === 0"
			empty-state="You haven't asked any questions yet."
			loading-text="Loading questions..."
		>
			<div v-for="q in questions" :key="q.id" class="my-questions__item">
				<div class="my-questions__header">
					<span class="my-questions__recipient">
						To:
						<NuxtLink
							:to="
								ROUTES.PROFILE_USER(
									q.to_username || q.to_user_id
								)
							"
							class="my-questions__recipient-link"
						>
							{{ q.to_username || q.to_user_id }}
						</NuxtLink>
					</span>
					<span class="my-questions__date">{{
						formatDate(q.created_at)
					}}</span>
				</div>
				<div class="my-questions__question">{{ q.question }}</div>
				<div v-if="q.answer" class="my-questions__answer">
					<strong>Answered:</strong> {{ q.answer }}
				</div>
				<div v-else class="my-questions__pending">
					<em>Pending answer...</em>
				</div>
			</div>
		</LoadingError>
	</div>
</template>
