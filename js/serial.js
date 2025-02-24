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
    
        connectButton.disabled = true;
    
        let latestValue = "";
        let lastValue = "";
        let unchangedCount = 0;
        const unchangedThreshold = 100;
        let buffer = "";
        
        const updateDisplay = () => {
            console.log("Buffer content:", buffer);
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
    
        const intervalId = setInterval(updateDisplay, 500);
    
        // Listen to data coming from the serial device.
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                reader.releaseLock();
                clearInterval(intervalId);
                break;
            }
            
            console.log("Raw serial data:", value);
            
            // Concatenate the incoming data to the buffer
            buffer += value;
            
            // Look for complete lines in the buffer
            let lines = buffer.split('\n');
            if (lines.length > 1) {
                // Process all complete lines except the last one
                for (let i = 0; i < lines.length - 1; i++) {
                    let line = lines[i].trim();
                    console.log("Processing line:", line);
                    
                    // Simplified regex to match just the number
                    let match = line.match(/(\d+\.?\d*)/);
                    if (match) {
                        latestValue = match[1];
                        console.log("Successfully parsed value:", latestValue);
                    } else {
                        console.log("Failed to match line pattern");
                    }
                }
                buffer = lines[lines.length - 1];
            }
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


