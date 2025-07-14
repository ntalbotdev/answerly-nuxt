<script setup lang="ts">
const props = defineProps<{ open: boolean; username?: string }>();
const emit = defineEmits(["close", "confirm"]);
function close() {
	emit("close");
}
function confirm() {
	emit("confirm");
}
</script>

<template>
	<AppModal :open="props.open" title="Confirm" @close="close">
		<div class="confirm-unfollow-modal__content">
			<p>
				Are you sure you want to stop following
				<strong>{{ props.username }}</strong>?
			</p>
			<div class="confirm-unfollow-modal__actions">
				<button class="btn btn--secondary" @click="close">
					Cancel
				</button>
				<button class="btn btn--danger" @click="confirm">
					Unfollow
				</button>
			</div>
		</div>
	</AppModal>
</template>

<style scoped lang="scss">
@import "~/assets/css/variables.scss";

.confirm-unfollow-modal__content {
	@apply flex flex-col gap-4;
	color: $color-bg;
}
.confirm-unfollow-modal__actions {
	@apply flex justify-end gap-4;
}
</style>
