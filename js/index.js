let wsUrl = 'wss://socketsbay.com/wss/v2/3678/0d8a3225331b58a1b0f915a526686ab5/'
const messageInput = document.querySelector('#message-input');
const colorButtons = document.querySelectorAll('.color-button');
const itemButtons = document.querySelectorAll('.item-button');
const submitButton = document.querySelector('#submit');

let selectedColor = null;
let selectedItem = null;

function writeLog(message) {
    document.getElementById('log').textContent = message;
}

var Textcolor = "rgb(255, 255, 255)"
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

colorButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedColor = button.classList[1];
        colorButtons.forEach(button => button.classList.remove('selected'));
        button.classList.add('selected');
    });
});

itemButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedItem = button.dataset.item;
        itemButtons.forEach(button => button.classList.remove('selected'));
        button.classList.add('selected');
    });
});

async function connectWebSocket(url) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(url);

        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            writeLog("已連接server");
            resolve(socket);
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            writeLog('未連線，請重新整理或發送訊息嘗試連線');
            reject(error);
        });
    });
}

async function main() {
    let socket;

    const connect = async () => {
        try {
            socket = await connectWebSocket(wsUrl);
            console.log('WebSocket connected');
            writeLog("已連接");
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            writeLog("無法連接，請確認server開啟");
            // 重新連線
            setTimeout(connect, 3000);
        }
    };

    submitButton.addEventListener('click', async () => {
        // 如果 WebSocket 沒有連線，先重新連線
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            await connect();
        }

        if (selectedColor && selectedItem && messageInput.value.trim() !== '') {
            const Button = document.querySelector('.' + selectedColor);
            const backgroundColor = getComputedStyle(Button).getPropertyValue('background-color');
            Textcolor = rgb2hex(backgroundColor);

            var json = { "color": Textcolor, "item": selectedItem, "message": messageInput.value };
            json = JSON.stringify(json);
            socket.send(json);
            writeLog("訊息已發送");
        }
        setTimeout(ReEnableButton, 1000)
        submitButton.setAttribute('disabled', '');
    });

    // 初始化時先連線 WebSocket
    await connect();
}

function ReEnableButton() {
    submitButton.removeAttribute('disabled');
}

main();

