<script setup lang="ts">
const props = defineProps<{
	open: boolean;
	title?: string;
}>();
const emit = defineEmits(["close", "update:open"]);
const modelValue = computed({
	get: () => props.open,
	set: (val: boolean) => emit("update:open", val),
});
function close() {
	modelValue.value = false;
	emit("close");
}
</script>

<template>
	<div v-if="open" class="modal__overlay" @click.self="close">
		<div class="modal__content-wrapper">
			<div class="modal__content">
				<button
					class="modal__close"
					aria-label="Close modal"
					@click="close"
				>
					<Icon name="bx:x" />
				</button>
				<h3 v-if="title" class="modal__title">{{ title }}</h3>
				<slot />
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
@import "~/assets/css/variables.scss";

.modal__overlay {
	@apply fixed inset-0 z-50 flex items-center justify-center bg-black/40;
	backdrop-filter: blur(2px);
}

.modal__content-wrapper {
	@apply relative rounded-md shadow-lg;
	min-width: 20vw;
	max-width: 90vw;
	margin-top: 65px; // Adjusted for header height
	background: $color-text;

	&:before {
		@apply absolute inset-0 rounded-lg;
		content: "";
		inset: -4px;
		background: $color-border;
		z-index: -1;
	}

	&:after {
		@apply absolute inset-0 rounded-lg;
		content: "";
		inset: -6px;
		background: $color-text;
		z-index: -2;
	}
}

.modal__content {
	@apply relative z-10 flex flex-col gap-4 px-6 pb-6 pt-2;
	max-height: calc(85vh - 65px); // Adjusted for header height
	overflow-y: auto;
}

.modal__close {
	@apply absolute right-2 top-2 cursor-pointer text-3xl;
	background: transparent;
	border: none;
	color: $color-surface;

	&:hover {
		color: $color-muted;
	}
}

.modal__title {
	@apply text-xl font-semibold;
	color: $color-bg;
}
</style>
