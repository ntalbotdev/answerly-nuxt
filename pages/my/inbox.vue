<script setup lang="ts">
import { useQuestionsStore } from "~/stores/questions";
import type { Question } from "~/stores/questions";

const questionsStore = useQuestionsStore();
const questions = ref<(Question & { _answer: string; _saving: boolean })[]>([]);
const loading = ref(true);

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
}

async function fetchMyQuestions() {
    loading.value = true;
    const res = await questionsStore.fetchIncomingQuestions();
    questions.value = res.map((q) => ({ ...q, _answer: "", _saving: false }));
    loading.value = false;
}

async function answerQuestion(
    q: Question & { _answer: string; _saving: boolean }
) {
    q._saving = true;
    await questionsStore.answerQuestion(q.id, q._answer);
    q.answer = q._answer;
    q._saving = false;
}

onMounted(fetchMyQuestions);
</script>

<template>
    <div class="my-questions-page">
        <h1>My Inbox</h1>
        <div v-if="loading">Loading...</div>
        <div v-else>
            <div v-if="questions.length === 0">No questions to answer.</div>
            <div v-for="q in questions" :key="q.id" class="question-item">
                <div class="question-meta">
                    <span
                        >From: <span v-if="q.is_anonymous">Anonymous</span
                        ><span v-else>{{ q.asker_username }}</span></span
                    >
                    <span class="date">{{ formatDate(q.created_at) }}</span>
                </div>
                <div class="question-body">{{ q.question }}</div>
                <div v-if="!q.answer">
                    <textarea
                        v-model="q._answer"
                        placeholder="Type your answer..."
                        rows="2"
                    />
                    <button
                        :disabled="q._saving || !q._answer"
                        @click="answerQuestion(q)"
                    >
                        Answer & Publish
                    </button>
                </div>
                <div v-else class="answered">
                    <strong>Answered:</strong> {{ q.answer }}
                </div>
            </div>
        </div>
    </div>
</template>
