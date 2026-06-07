<template>
  <div>
    <video
      ref="videoRef"
      autoplay
      playsinline
      muted
      style="width: 100%; max-width: 100%; height:100%;"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const videoRef = ref(null)
let stream = null

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })

    videoRef.value.srcObject = stream
  } catch (error) {
    console.error('카메라 접근 실패:', error)
  }
})

onBeforeUnmount(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
})
</script>