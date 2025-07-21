<script setup lang="ts">
import { useQuestionsStore } from '~/stores/questions'
const props = defineProps<{ userId: string }>()

const questions = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const questionsStore = useQuestionsStore()

async function fetchAnsweredQuestions() {
  loading.value = true
  error.value = null
  try {
    const data = await questionsStore.fetchAnsweredQuestionsForUser(props.userId)
    questions.value = data || []
  } catch (e: any) {
    error.value = e.message || 'Failed to load questions.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchAnsweredQuestions)
watch(() => props.userId, fetchAnsweredQuestions)
</script>

<template>
  <div class="questions">
	<h3 class="questions__title">Answered Questions</h3>

	<div v-if="loading" class="loading-text">Loading...</div>

	<div v-else-if="error" class="error-text">{{ error }}</div>

	<div v-else-if="questions.length === 0" class="questions__empty">No answered questions yet.</div>

	<ul v-else class="questions__list">
	  <li v-for="q in questions" :key="q.id" class="questions__item">
		<div class="questions__question">
			<img v-if="q.profiles.avatar_url" :src="q.profiles.avatar_url" alt="Avatar" class="questions__asker-avatar" />

			<div v-if="q.profiles" class="questions__asker-wrapper">
				<div class="questions__asker">
					<span class="questions__asker-name">{{ q.profiles.display_name || q.profiles.username }}</span>
					<span class="questions__asker-username">@{{ q.profiles.username }}</span>
				</div>
				
				<div class="questions__question-text">{{ q.question }}</div>
			</div>
		</div>

		<div class="questions__answer">
			<div class="questions__answer-text">{{ q.answer }}</div>
			<div class="questions__answer-date">Answered on {{ formatDateNoSeconds(q.answered_at) }}</div>
		</div>
		
		
	  </li>
	</ul>
  </div>
</template>
