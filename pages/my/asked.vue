<script setup lang="ts">
import { useQuestionsStore } from "~/stores/questions";
import type { Question } from "~/stores/questions";

const questionsStore = useQuestionsStore();
const questions = ref<(Question & { to_username?: string })[]>([]);
const loading = ref(true);

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
}

async function fetchAskedQuestions() {
    loading.value = true;
    const res = await questionsStore.fetchAskedQuestions();
    questions.value = res;
    loading.value = false;
}

onMounted(fetchAskedQuestions);
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
                    <span>To: {{ q.to_username || q.to_user_id }}</span>
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
