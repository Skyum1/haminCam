<template>
  <div>
    <h2>하민 카메라11</h2>

    <video
      ref="remoteVideo"
      autoplay
      playsinline
      controls
      style="width: 100%; border: 1px solid #ccc"
    />
    <button @click="startCamera">
        카메라 시작
      </button>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { io } from 'socket.io-client'

const remoteVideo = ref(null)

// const socket = io('http://192.168.45.126:3000')
let socket = io('https://192.168.45.95:3000')
// 본인 PC IP로 변경

let pc = null

onMounted(() => {
  if(window.location.hostname.startsWith('192.168.')) {
    socket = io('https://hamincam.mooo.com:3000')
  }
})
const peerConnection = new RTCPeerConnection({
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
})

function createPeer() {
  pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  })

  pc.ontrack = (event) => {
    remoteVideo.value.srcObject = event.streams[0]
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', event.candidate)
    }
  }
}

/**
 * 송신자(PC)가 보낸 영상 수신
 */
peerConnection.ontrack = (event) => {
  console.log('영상 수신')

  remoteVideo.value.srcObject = event.streams[0]
}

/**
 * ICE Candidate 생성 시 송신자에게 전달
 */
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('ice-candidate', event.candidate)
  }
}

/**
 * Offer 수신
 */
socket.on('offer', async (offer, senderId) => {
  console.log('offer 받음')

  await pc.setRemoteDescription(offer)

  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)

  socket.emit('answer', answer,senderId)
})

socket.on('ice-candidate', async (candidate) => {
  if (pc) {
    try {
      await pc.addIceCandidate(candidate)
    } catch (e) {}
  }
})

function startCamera() {
  try {
    socket.emit('viewer-joined');
    createPeer();
  } catch (err) {
    console.error(err)
  }
}
</script>