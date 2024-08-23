let port;
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const output = document.getElementById('output');

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("h3").textContent = `Value of ultrasonic sensor`;
    requestWakeLock();

    connectButton.addEventListener('click', async () => {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
    
        // disconnectButton.disabled = false;
        connectButton.disabled = true;
    
        let latestValue = "";
        let lastValue = "";
        let unchangedCount = 0;
        const unchangedThreshold = 3; // Number of intervals to wait before displaying the signal not found message
        
        
        const updateDisplay = () => {
            console.log(`Latest value: ${latestValue}, Last value: ${lastValue}, Unchanged count: ${unchangedCount}`);
            if (latestValue) {
                if (latestValue === lastValue) {
                    unchangedCount++;
                    if (unchangedCount >= unchangedThreshold) {
                        output.innerHTML = '<span style="color:red;">Signal not found</span>';
                    } else {
                        output.textContent = latestValue + "cm";
                    }
                } else {
                    output.textContent = latestValue + "cm";
                    unchangedCount = 0;
                }
                lastValue = latestValue;
            } else {
                output.innerHTML = '<span style="color:red;">Signal not found</span>';
            }
        };
    
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
            // Update the latest value or set it to an empty string if no value is received
            latestValue = value || "";
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
    


    
    // disconnectButton.addEventListener('click', async () => {
    //     await port.close();
    //     disconnectButton.disabled = true;
        
    //     connectButton.disabled = false;
    //     output.textContent += '\nSerial port closed.';
    // });
        
});


