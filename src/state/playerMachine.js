import { createMachine } from 'xstate';

export const playerMachine = createMachine({
    id: 'player',
    initial: 'idle',
    states: {
        idle: {
            on: { OPEN: 'opened' },
        },
        opened: {
            on: {
                CLOSE: 'closed',
                MINIMIZE: 'minimized',
            },
        },
        minimized: {
            on: {
                MAXIMIZE: 'opened',
                CLOSE: 'closed',
            },
        },
        closed: {
            on: { OPEN: 'opened' },
        },
    },
});
