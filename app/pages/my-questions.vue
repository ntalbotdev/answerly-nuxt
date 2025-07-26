<script setup lang="ts">
const questionsStore = useQuestionsStore();
const questions = ref<(Question & { to_username?: string })[]>([]);
const loading = ref(true);

definePageMeta({
	// This page requires authentication
	middleware: "auth",
});

// Format date to a readable string
function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleString();
}

// Fetch the questions asked by the user
async function fetchAskedQuestions() {
	loading.value = true;
	const res = await questionsStore.fetchAskedQuestions();
	questions.value = res;
	loading.value = false;
}
onMounted(fetchAskedQuestions);

useHead({
	title: "Questions I Asked",
	meta: [
		{ name: "description", content: "View the questions you have asked." },
	],
});
</script>

<template>
	<div>
		<h1>Questions I Asked</h1>
		<div v-if="loading">Loading...</div>
		<div v-else>
			<div v-if="questions.length === 0">
				You haven't asked any questions yet.
			</div>
			<div v-for="q in questions" :key="q.id">
				<div>
					<span>
						To:
						<NuxtLink :to="`/profile/${q.to_username}`">{{
							q.to_username || q.to_user_id
						}}</NuxtLink>
					</span>
					<span>{{ formatDate(q.created_at) }}</span>
				</div>
				<div>{{ q.question }}</div>
				<div v-if="q.answer">
					<strong>Answered:</strong> {{ q.answer }}
				</div>
				<div v-else>
					<em>Pending answer...</em>
				</div>
			</div>
		</div>
	</div>
</template>
