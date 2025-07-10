<script setup lang="ts">
import { useProfileStore } from "~/stores/profile";
const route = useRoute();
const profileStore = useProfileStore();
const username = route.params.username as string;
const loading = ref(true);
const error = ref("");
const questions = ref<any[]>([]);

onMounted(async () => {
    await profileStore.fetchProfileByUsername(username);
    if (!profileStore.publicProfile) {
        error.value = "User not found.";
        loading.value = false;
        return;
    }
    await fetchQuestions();
});

async function fetchQuestions() {
    loading.value = true;
    error.value = "";
    const supabase = useSupabaseClient();
    const { data, error: qError } = await supabase
        .from("questions")
        .select(
            "id, from_user_id, question, is_anonymous, answer, published, created_at, profiles:from_user_id(username, avatar_url)"
        )
        .eq("to_user_id", profileStore.publicProfile.user_id)
        .eq("published", true) // Only fetch published questions
        .order("created_at", { ascending: false });
    if (qError) {
        error.value = qError.message || "Failed to load questions.";
        questions.value = [];
    } else {
        questions.value = data || [];
    }
    loading.value = false;
}

function goToAsk() {
    navigateTo(`/ask/${username}`);
}
</script>

<template>
    <div>
        <h1>
            Questions for {{ profileStore.publicProfile?.username || username }}
        </h1>
        <button @click="goToAsk">
            Ask {{ profileStore.publicProfile?.username || username }} a
            question
        </button>
        <div v-if="loading">Loading...</div>
        <div v-else-if="error" style="color: red">{{ error }}</div>
        <div v-else>
            <div v-if="questions.length === 0">No questions yet.</div>
            <ul v-else>
                <li v-for="q in questions" :key="q.id">
                    <div>
                        {{ q.question }}
                    </div>
                    <div>
                        Asked by
                        <template v-if="q.is_anonymous">
                            <strong>Anonymous</strong>
                        </template>
                        <template v-else>
                            <span v-if="q.profiles">
                                <img
                                    v-if="q.profiles.avatar_url"
                                    :src="q.profiles.avatar_url"
                                    alt="avatar"
                                    style="
                                        width: 24px;
                                        height: 24px;
                                        border-radius: 50%;
                                        vertical-align: middle;
                                        margin-right: 4px;
                                    "
                                />
                                {{ q.profiles.username }}
                            </span>
                            <span v-else>Unknown</span>
                        </template>
                        on {{ new Date(q.created_at).toLocaleString() }}
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
