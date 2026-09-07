<script setup>
defineProps({ step: { type: Object, required: true } })
</script>

<template>
  <div class="story">
    <p v-for="(line, k) in step.lines" :key="k" :class="{ voice: line.startsWith('“') }">{{ line }}</p>
  </div>
  <pre v-if="step.code">{{ step.code }}</pre>
</template>
