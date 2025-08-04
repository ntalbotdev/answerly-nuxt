<script setup lang="ts">
import { useNotificationsStore } from "@/stores/notifications";

const notificationsStore = useNotificationsStore();
notificationsStore.fetchNotifications();

useHead({
	title: "Notifications",
	meta: [{ name: "description", content: "View your notifications." }],
});
</script>

<template>
	<div class="notifications">
		<h2 class="">Notifications</h2>
	</div>
</template>
