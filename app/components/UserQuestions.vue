<script setup lang="ts">
import type { Profile } from "~/stores/profile";
import type { Question } from "~/stores/questions";
const props = defineProps<{ userId: string; profile: Profile }>();
const { profile } = props;
const questions = ref<Question[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchAnsweredQuestions() {
	loading.value = true;
	error.value = null;
	try {
		const data = await fetchAnsweredQuestionsForUser(props.userId);
		questions.value = data || [];
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
onMounted(fetchAnsweredQuestions);
watch(() => props.userId, fetchAnsweredQuestions);
</script>

<template>
	<div class="questions">
		<h3 class="questions__title">Answered Questions</h3>

		<LoadingError
			:loading="loading"
			:error="error || ''"
			:show-empty-state="questions.length === 0"
			empty-state="No answered questions yet."
			loading-text="Loading questions..."
		>
			<ul class="questions__list">
				<li v-for="q in questions" :key="q.id" class="questions__item">
					<div class="questions__question">
						<img
							v-if="!q.is_anonymous && q.profiles?.avatar_url"
							:src="q.profiles.avatar_url"
							alt="Avatar"
							class="questions__person-avatar"
						/>

						<div class="questions__person-wrapper">
							<div
								v-if="!q.is_anonymous && q.profiles"
								class="questions__person questions__person--asker"
							>
								<span class="questions__person-name">
									{{
										q.profiles.display_name ||
										q.profiles.username
									}}
								</span>
								<span class="questions__person-username">
									@{{ q.profiles.username }}
								</span>
							</div>

							<div
								v-else-if="q.is_anonymous"
								class="questions__person questions__person--anonymous"
							>
								<span class="questions__person-name">
									Anonymous
								</span>
							</div>

							<div class="questions__question-text">
								{{ q.question }}
							</div>

							<div class="questions__question-date">
								{{ formatDateNoSeconds(q.created_at) }}
							</div>
						</div>
					</div>

					<div class="questions__answer">
						<img
							v-if="profile?.avatar_url"
							:src="profile.avatar_url"
							alt="Avatar"
							class="questions__person-avatar"
						/>

						<div class="questions__person-wrapper">
							<div
								class="questions__person questions__person--answerer"
							>
								<span class="questions__person-name">
									{{
										profile?.display_name ||
										profile?.username
									}}
								</span>
								<span class="questions__person-username">
									@{{ profile?.username }}
								</span>
							</div>

							<div
								class="questions__question-text questions__question-text--answer"
							>
								{{ q.answer }}
							</div>

							<div class="questions__question-date">
								{{
									q.answered_at
										? formatDateNoSeconds(q.answered_at)
										: ""
								}}
							</div>
						</div>
					</div>
				</li>
			</ul>
		</LoadingError>
	</div>
</template>
