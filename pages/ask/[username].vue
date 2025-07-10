<script setup lang="ts">
import { ref } from "vue";
import { useProfileStore } from "~/stores/profile";
import { useQuestionsStore } from "~/stores/questions";
const route = useRoute();
const router = useRouter();
const user = useSupabaseUser();
const profileStore = useProfileStore();
const questionsStore = useQuestionsStore();
const username = route.params.username as string;
const loading = ref(true);
const error = ref("");
const form = ref({
    question: "",
    is_anonymous: false,
});

definePageMeta({
    // This page requires authentication
    middleware: "auth",
});

onMounted(async () => {
    await profileStore.fetchProfileByUsername(username);
    if (!profileStore.publicProfile) {
        error.value = "User not found.";
        loading.value = false;
        return;
    }
    // Only prevent asking yourself
    if (user.value && profileStore.publicProfile.user_id === user.value.id) {
        return router.push("/my/inbox");
    }
    loading.value = false;
});

async function submitQuestion() {
    error.value = "";
    if (!user.value) {
        error.value = "You must be logged in to ask a question.";
        return;
    }
    if (!form.value.question.trim()) {
        error.value = "Question is required.";
        return;
    }
    if (!profileStore.publicProfile) {
        error.value = "Target user not found.";
        return;
    }
    await questionsStore.createQuestion({
        from_user_id: user.value.id,
        to_user_id: profileStore.publicProfile.user_id,
        question: form.value.question,
        is_anonymous: form.value.is_anonymous,
    });
    if (questionsStore.error) {
        error.value = questionsStore.error;
        return;
    }
    router.push(`/profile/${profileStore.publicProfile.username}/questions`);
}
</script>

<template>
    <div>
        <h1>Ask {{ profileStore.publicProfile?.username || username }}</h1>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">{{ error }}</div>
        <form v-else @submit.prevent="submitQuestion">
            <div>
                <label>Question</label>
                <input
                    v-model="form.question"
                    required
                    placeholder="Type your question..."
                />
            </div>
            <div style="margin: 0.5em 0">
                <label>
                    <input v-model="form.is_anonymous" type="checkbox" />
                    Ask anonymously
                </label>
            </div>
            <button type="submit">Send Question</button>
        </form>
    </div>
</template>
