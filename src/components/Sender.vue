<template>
  <div>
    <h2>PC Camera Sender</h2>

    <video
      ref="localVideo"
      autoplay
      playsinline
      muted
      style="width: 800px; border: 1px solid #ccc"
    />

    <div style="margin-top: 20px">
      <button @click="startCamera">
        카메라 시작
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { io } from 'socket.io-client'

const localVideo = ref(null)

const socket = io('http://192.168.45.126:3000')
// ↑ 본인 PC IP로 변경

let peers = {};
let localStream = null

async function createPeer(viewerId) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  })

  peers[viewerId] = pc;

  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream)
  })

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', event.candidate, viewerId)
    }
  }

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)

  socket.emit('offer', offer, viewerId)

  return pc;
}

async function startCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const usbCamera = devices.find(
      device =>
        device.kind === "videoinput" &&
        device.label.includes("USB")
    );
    // 카메라 획득
    if (usbCamera) {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            exact: usbCamera.deviceId
          }
        },
        audio: true
      });

      localVideo.value.srcObject = localStream;
    }

  } catch (err) {
    console.error(err)
  }
}

// 휴대폰이 보낸 Answer 수신
socket.on('answer', async (answer, socketId) => {

  console.log('answer 수신')

  await peers[socketId].setRemoteDescription(
    new RTCSessionDescription(answer)
  )
})

// 휴대폰이 보낸 ICE 수신
socket.on('ice-candidate', async (candidate, socketId) => {

  try {
    await peers[socketId].addIceCandidate(
      new RTCIceCandidate(candidate)
    )
  } catch (err) {
    console.error(err)
  }
})

socket.on("viewer-joined", async (viewerId) => {
  await createPeer(viewerId);
  // const pc = await createPeer(viewerId);
  // const offer = await pc.createOffer();
  // await pc.setLocalDescription(offer);
  // socket.to(viewerId).emit('offer', offer);
});
</script>