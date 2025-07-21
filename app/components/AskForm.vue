<script setup lang="ts">
interface Profile {
	user_id: string;
	username: string;
	[key: string]: unknown;
}

const props = defineProps<{ profile: Profile }>();
const emit = defineEmits(["close", "submitted"]);

const router = useRouter();
const user = useSupabaseUser();
const questionsStore = useQuestionsStore();

const loading = ref(false);
const error = ref("");
const form = ref({
	question: "",
	is_anonymous: false,
});

async function submitQuestion() {
	loading.value = true;
	error.value = "";
	
	if (!user.value) {
		error.value = "You must be logged in to ask a question.";
		loading.value = false;
		return;
	}
	
	if (!form.value.question.trim()) {
		error.value = "Question is required.";
		loading.value = false;
		return;
	}
	
	try {
		await questionsStore.createQuestion({
			from_user_id: user.value.id,
			to_user_id: props.profile.user_id,
			question: form.value.question,
			is_anonymous: form.value.is_anonymous,
		});
		
		if (questionsStore.error) {
			error.value = questionsStore.error;
			return;
		}
		
		// Reset form
		form.value.question = "";
		form.value.is_anonymous = false;
		
		emit("submitted");
		emit("close");

	router.push(ROUTES.PROFILE_USER(props.profile.username));
	
	} catch {
		error.value = "Failed to send question. Please try again.";
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<form class="ask-form" @submit.prevent="submitQuestion">
		<div v-if="error" class="error-text">
			{{ error }}
		</div>
		
		<div class="ask-form__field">
			<label for="question" class="ask-form__label">Question</label>
			<textarea
				id="question"
				v-model="form.question"
				class="ask-form__input ask-form__input--textarea"
				rows="4"
				required
				placeholder="What would you like to ask?"
			/>
		</div>
		
		<div class="ask-form__field">
			<label class="ask-form__checkbox-label">
				<input
					v-model="form.is_anonymous"
					type="checkbox"
					class="ask-form__checkbox"
				>
				<span class="ask-form__checkbox-text">Ask anonymously</span>
			</label>
		</div>
		
		<div class="ask-form__button-wrapper">
			<button
				type="button"
				class="btn btn--secondary"
				@click="$emit('close')"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="btn btn--primary"
				:disabled="loading || !form.question.trim()"
			>
				{{ loading ? "Sending..." : "Send Question" }}
			</button>
		</div>
	</form>
</template>
