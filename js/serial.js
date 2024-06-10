let port;
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const output = document.getElementById('output');

connectButton.addEventListener('click', async () => {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    disconnectButton.disabled = false;
    connectButton.disabled = true;

    let latestValue = "";

    // Function to update the display every 2 seconds
    const updateDisplay = () => {
        output.textContent = latestValue + "cm";
    };

    // Update display every 2 seconds
    const intervalId = setInterval(updateDisplay, 1000);

    // Listen to data coming from the serial device.
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            clearInterval(intervalId); // Clear the interval when done reading
            break;
        }
        // Update the latest value
        latestValue = value;
    }
});
let wakeLock = null;

    async function requestWakeLock() {
      try {
        // Request a wake lock
        wakeLock = await navigator.wakeLock.request('screen');

        // Listen for state changes
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
    await port.close();
    disconnectButton.disabled = true;
    
    connectButton.disabled = false;
    output.textContent += '\nSerial port closed.';
});
