<script setup lang="ts">
import imageCompression from "browser-image-compression";

const emit = defineEmits(["compressed"]);
const props = defineProps<{
  maxWidthOrHeight?: number;
  fileType?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}>();

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;
  let file = target.files[0];
  const options = {
    maxSizeMB: props.maxSizeMB ?? 10,
    maxWidthOrHeight: props.maxWidthOrHeight ?? 200,
    useWebWorker: true,
    fileType: props.fileType ?? "image/webp",
  };
  file = await imageCompression(file, options);
  emit("compressed", file);
}
</script>

<template>
  <input
    type="file"
    accept="image/*"
    :disabled="disabled"
    @change="handleFileChange"
  />
</template>
