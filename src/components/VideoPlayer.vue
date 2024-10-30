<template>
    <div class="container">
        <div @click="openPlayer" class="box">
            <span>
                <svg
                    viewBox="64 64 896 896"
                    focusable="false"
                    data-icon="play-circle"
                    width="30px"
                    height="30px"
                    fill="blueviolet"
                    aria-hidden="true"
                >
                    <path
                        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"
                    ></path>
                    <path
                        d="M719.4 499.1l-296.1-215A15.9 15.9 0 00398 297v430c0 13.1 14.8 20.5 25.3 12.9l296.1-215a15.9 15.9 0 000-25.8zm-257.6 134V390.9L628.5 512 461.8 633.1z"
                    ></path>
                </svg>
            </span>
        </div>
        <a-modal
            :open="isModalVisible"
            :width="modalWidth"
            @cancel="closePlayer"
            @after-open="initializePlayer"
        >
            <template #title>Видеоплеер</template>

            <div :style="modalHeightStyle">
                <video
                    ref="videoPlayer"
                    class="video-js vjs-default-skin"
                    controls
                ></video>
            </div>

            <template #footer>
                <a-button v-if="!isMinimized" @click="minimizePlayer">
                    Минимизировать
                </a-button>
                <a-button v-else @click="maximizePlayer"> Развернуть </a-button>
                <a-button @click="closePlayer">Закрыть</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useMachine } from '@xstate/vue';
import { playerMachine } from '../state/playerMachine';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const { snapshot, send } = useMachine(playerMachine);
const videoPlayer = ref(null);
let playerInstance = null;

const isModalVisible = computed(
    () =>
        snapshot.value.matches('opened') || snapshot.value.matches('minimized')
);
const isMinimized = computed(() => snapshot.value.matches('minimized'));
const modalWidth = computed(() => (isMinimized.value ? 300 : 800));
const modalHeightStyle = computed(() => ({
    height: isMinimized.value ? '150px' : '500px',
}));

const initializePlayer = async () => {
    if (playerInstance) {
        return;
    }
    await nextTick();

    if (videoPlayer.value) {
        playerInstance = videojs(videoPlayer.value, {
            controls: true,
            autoplay: true,
            sources: [
                {
                    src: 'https://cdn.flowplayer.com/d9cd469f-14fc-4b7b-a7f6-ccbfa755dcb8/hls/383f752a-cbd1-4691-a73f-a4e583391b3d/playlist.m3u8',
                    type: 'application/x-mpegURL',
                },
            ],
        });

        playerInstance.ready(() => {
            playerInstance.play();
        });

        playerInstance.on('error', error =>
            console.error('Ошибка Video.js:', error)
        );
    } else {
        console.error('Элемент videoPlayer не найден');
    }
};

const openPlayer = () => send({ type: 'OPEN' });
const closePlayer = () => {
    send({ type: 'CLOSE' });
};
const minimizePlayer = () => send({ type: 'MINIMIZE' });
const maximizePlayer = () => send({ type: 'MAXIMIZE' });

watch(
    () => snapshot.value,
    async newState => {
        if (newState.matches('opened')) {
            await nextTick();
            initializePlayer();
        }
    }
);
</script>

<style scoped>
.video-js {
    width: 100%;
    height: 100%;
}

.container {
    max-width: 300px;
    width: 100%;
    margin: 0 auto;
}

.box {
    width: 300px;
    height: 150px;
    margin-top: 100px;
    border: 1px solid blueviolet;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}
</style>
