<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
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

useHead({
  titleTemplate: '%s - Answerly',
  meta: [
    { name: 'description', content: 'A platform for asking and answering questions.' }
  ]
})
</script>
