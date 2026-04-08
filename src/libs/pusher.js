import PusherJS from 'pusher-js';

PusherJS.logToConsole = true;

const client = new PusherJS(import.meta.env.VITE_PUSHER_APP_KEY, {
    wsHost: import.meta.env.VITE_PUSHER_APP_HOST,
    wssPort: Number(import.meta.env.VITE_PUSHER_APP_PORT),
    cluster: "",
    forceTLS: true,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
});

export default client;
