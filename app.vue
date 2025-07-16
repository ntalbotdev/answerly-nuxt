<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useQuestionsStore } from '~/stores/questions'
import { watch } from 'vue'

const user = useSupabaseUser()
const questionsStore = useQuestionsStore()

onMounted(() => {
  if (user.value) {
    questionsStore.fetchIncomingQuestions()
  }
})

// Watch for user login/logout and refetch inbox questions
watch(user, (newUser) => {
  if (newUser) {
    questionsStore.fetchIncomingQuestions()
  } else {
    questionsStore.inboxQuestions = []
  }
})
</script>
