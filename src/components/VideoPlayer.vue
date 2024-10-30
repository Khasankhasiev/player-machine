<template>
    <div class="container">
        <a-button type="primary" @click="openPlayer">Открыть плеер</a-button>

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
            console.log('Плеер готов, начинаем воспроизведение');
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
    max-width: 1000px;
    width: 100px;
    margin: 0 auto;
}
</style>
