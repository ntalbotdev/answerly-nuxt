<script setup lang="ts">
import { storeToRefs } from "pinia";
const questionsStore = useQuestionsStore();
const { inboxQuestions } = storeToRefs(questionsStore);
const loading = ref(true);
const error = ref<string | null>(null);
const showRemoveModal = ref(false);
const questionToRemove = ref<
	| (Question & { _answer: string; _saving: boolean; _showForm: boolean })
	| null
>(null);

const questionsWithUi = ref<
	Array<Question & { _answer: string; _saving: boolean; _showForm: boolean }>
>([]);

function syncQuestionsWithUi() {
	const existingUiState = new Map<
		string,
		{ _answer: string; _saving: boolean; _showForm: boolean }
	>();

	questionsWithUi.value.forEach((q) => {
		existingUiState.set(q.id, {
			_answer: q._answer,
			_saving: q._saving,
			_showForm: q._showForm,
		});
	});

	questionsWithUi.value = inboxQuestions.value.map((q) => ({
		...q,
		_answer: existingUiState.get(q.id)?._answer || "",
		_saving: existingUiState.get(q.id)?._saving || false,
		_showForm: existingUiState.get(q.id)?._showForm || false,
	}));
}
watch(inboxQuestions, syncQuestionsWithUi, { immediate: true });

async function fetchMyQuestions() {
	loading.value = true;
	error.value = null;
	try {
		const { fetchInboxQuestions } = useInboxQuestions();
		await fetchInboxQuestions();
		syncQuestionsWithUi();
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
onMounted(fetchMyQuestions);

async function answerQuestion(
	q: Question & { _answer: string; _saving: boolean; _showForm: boolean }
) {
	q._saving = true;
	await questionsStore.answerQuestion(q.id, q._answer);
	q.answer = q._answer;
	q._saving = false;
	q._showForm = false;

	questionsWithUi.value = questionsWithUi.value
		.filter(
			(qq, idx, arr) =>
				qq.id !== q.id &&
				arr.findIndex((item) => item.id === qq.id) === idx
		)
		.filter((qq) => qq.answer === null);

	questionsStore.inboxQuestions = questionsStore.inboxQuestions
		.filter(
			(qq, idx, arr) =>
				qq.id !== q.id &&
				arr.findIndex((item) => item.id === qq.id) === idx
		)
		.filter((qq) => qq.answer === null);

	const notificationsStore = useNotificationsStore();
	await notificationsStore.fetchNotifications();
}

function openRemoveModal(
	q: Question & { _answer: string; _saving: boolean; _showForm: boolean }
) {
	questionToRemove.value = q;
	showRemoveModal.value = true;
}

function closeRemoveModal() {
	showRemoveModal.value = false;
	questionToRemove.value = null;
}

async function confirmRemoveQuestion() {
	if (questionToRemove.value) {
		await questionsStore.deleteQuestion(questionToRemove.value.id);
		questionsWithUi.value = questionsWithUi.value
			.filter(
				(q, idx, arr) =>
					q.id !== questionToRemove.value!.id &&
					arr.findIndex((item) => item.id === q.id) === idx
			)
			.filter((q) => q.answer === null);

		questionsStore.inboxQuestions = questionsStore.inboxQuestions
			.filter(
				(q, idx, arr) =>
					q.id !== questionToRemove.value!.id &&
					arr.findIndex((item) => item.id === q.id) === idx
			)
			.filter((q) => q.answer === null);

		const notificationsStore = useNotificationsStore();
		await notificationsStore.fetchNotifications();

		closeRemoveModal();
	}
}

definePageMeta({
	middleware: "auth",
});

useHead({
	title: "Inbox",
	meta: [
		{ name: "description", content: "View and respond to your questions." },
	],
});
</script>

<template>
	<div class="section inbox">
		<h2 class="section__title inbox__title">Inbox</h2>
		<AppModal v-model:open="showRemoveModal" title="Remove">
			<template #default>
				<div class="inbox__modal-text">
					Are you sure you want to remove this question from
					<strong>
						{{ questionToRemove?.asker_username }}
					</strong>
					?
				</div>

				<div class="inbox__modal-question">
					{{ questionToRemove?.question }}
				</div>
				<div class="inbox__modal-buttons">
					<button
						class="btn btn--secondary"
						@click="closeRemoveModal"
					>
						Cancel
					</button>
					<button
						class="btn btn--danger"
						@click="confirmRemoveQuestion"
					>
						Remove
					</button>
				</div>
			</template>
		</AppModal>

		<LoadingError
			:loading="loading"
			:error="error || ''"
			:show-empty-state="questionsWithUi.length === 0"
			empty-state="No questions to answer."
			loading-text="Loading questions..."
		>
			<div class="inbox__questions">
				<div
					v-for="q in questionsWithUi"
					:key="q.id"
					class="inbox__question"
				>
					<div class="inbox__question-header">
						<div class="inbox__question-text">{{ q.question }}</div>

						<div class="inbox__question-metadata">
							<div class="inbox__question-asker-wrapper">
								From:
								<span
									v-if="q.is_anonymous"
									class="inbox__question-asker inbox__question-asker--anonymous"
								>
									Anonymous
								</span>

								<template v-else-if="q.asker_username">
									<NuxtLink
										:to="
											ROUTES.PROFILE_USER(
												q.asker_username
											)
										"
										class="inbox__question-asker inbox__question-asker--username"
									>
										{{ q.asker_username }}
									</NuxtLink>
								</template>

								<template v-else>Unknown User</template>
							</div>

							<span class="inbox__question-date">
								{{ formatDateNoSeconds(q.created_at) }}
							</span>
						</div>
					</div>

					<div v-if="!q.answer" class="inbox__question-form-wrapper">
						<div class="inbox__question-form-buttons">
							<button
								v-if="!q._showForm"
								type="button"
								class="btn btn--danger"
								@click="openRemoveModal(q)"
							>
								Remove
							</button>

							<button
								v-if="!q._showForm"
								class="btn btn--primary"
								@click="q._showForm = true"
							>
								Respond
							</button>
						</div>

						<template v-if="q._showForm">
							<form
								class="inbox__question-form"
								@submit.prevent="answerQuestion(q)"
							>
								<textarea
									v-model="q._answer"
									name="answer"
									class="inbox__question-form-input"
									placeholder="Type your answer..."
									rows="3"
								/>

								<div class="inbox__question-form-buttons">
									<button
										type="button"
										class="btn btn--secondary"
										@click="
											q._showForm = false;
											q._answer = '';
										"
									>
										Cancel
									</button>

									<button
										type="submit"
										class="btn btn--primary"
										:disabled="q._saving || !q._answer"
									>
										Answer & Publish
									</button>
								</div>
							</form>
						</template>
					</div>

					<div v-else class="inbox__question-answer">
						<span class="inbox__question-answer-label"
							>Answered:</span
						>
						<span class="inbox__question-answer-text">{{
							q.answer
						}}</span>
					</div>
				</div>
			</div>
		</LoadingError>
	</div>
</template>
