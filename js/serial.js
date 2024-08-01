let port;
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const output = document.getElementById('output');
let wakeLock = null;

connectButton.addEventListener('click', async () => {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        
        const textDecoder = new TextDecoder(); // Use default UTF-8 encoding
        const textDecoderStream = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoderStream.writable);
        const reader = textDecoderStream.readable.getReader();

        disconnectButton.disabled = false;
        connectButton.disabled = true;

        let latestValue = "";
        let buffer = '';

        const updateDisplay = () => {
            output.textContent = latestValue + "cm";
        };

        const intervalId = setInterval(updateDisplay, 1000);

        while (true) {
            try {
                const { value, done } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    clearInterval(intervalId);
                    break;
                }
                buffer += value;
                if (buffer.includes('\n')) {
                    // Assuming data ends with a newline character
                    latestValue = buffer.trim(); 
                    buffer = ''; // Clear buffer
                }
            } catch (error) {
                console.error('Error reading from serial port:', error);
            }
        }
    } catch (error) {
        console.error('Error connecting to the serial port:', error);
        output.textContent = 'Failed to connect to the serial port.';
    }
});

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock released');
        });
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    requestWakeLock();
});

disconnectButton.addEventListener('click', async () => {
    try {
        await port.close();
        disconnectButton.disabled = true;
        connectButton.disabled = false;
        output.textContent += '\nSerial port closed.';
    } catch (error) {
        console.error('Error disconnecting from the serial port:', error);
        output.textContent += '\nFailed to close the serial port.';
    }
});
