document.addEventListener('DOMContentLoaded', function() {
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    let isResponding = false;

    const audioSphere = document.getElementById('audio-sphere');
    const status = document.getElementById('status');
    const newSessionBtn = document.getElementById('new-session');
    let audioPlayer = new Audio();

    // Set initial status message
    status.textContent = 'Tap the sphere to start recording';

    audioSphere.onclick = async function () {
        // If a response is playing, stop the audio and reset the state
        if (isResponding) {
            audioPlayer.pause();  // Pause the currently playing audio
            audioPlayer.currentTime = 0;  // Reset the audio to the start
            isResponding = false;  // Reset responding state
            audioSphere.classList.remove('responding');
            status.textContent = 'Tap the sphere to start recording';  // Update the status to ready for new recording
            return;  // Exit early since we're stopping the response
        }

        if (!isRecording) {
            // Start recording
            try {
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                mediaRecorder.ondataavailable = function (e) {
                    audioChunks.push(e.data);
                };

                mediaRecorder.onstop = async function () {
                    let blob = new Blob(audioChunks, { type: 'audio/mp3' });
                    let formData = new FormData();
                    formData.append('audio', blob, 'audio.mp3');

                    status.textContent = 'Processing audio...';
                    
                    try {
                        let response = await fetch('/process_audio', {
                            method: 'POST',
                            body: formData
                        });

                        if (response.ok) {
                            let audioBlob = await response.blob();
                            let audioUrl = URL.createObjectURL(audioBlob);
                            audioPlayer.src = audioUrl;
                            status.textContent = 'Playing response...';

                            // Set the responding state
                            isResponding = true;
                            audioSphere.classList.remove('recording');
                            audioSphere.classList.add('responding');

                            audioPlayer.play();

                            audioPlayer.onended = function() {
                                status.textContent = 'Response finished. Tap the sphere to record again.';
                                isResponding = false;
                                audioSphere.classList.remove('responding');
                            };
                        } else {
                            status.textContent = 'Error processing audio';
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        status.textContent = 'Error processing audio';
                    }

                    audioChunks = [];
                };

                // Set recording state
                isRecording = true;
                audioSphere.classList.add('recording');
                status.textContent = 'Recording... tap again to stop';
            } catch (error) {
                console.error('Error accessing microphone:', error);
                status.textContent = 'Error accessing microphone';
            }
        } else {
            // Stop recording
            mediaRecorder.stop();
            isRecording = false;
            audioSphere.classList.remove('recording');
            status.textContent = 'Processing...';
        }
    };

    // Visualize audio input
    async function setupAudioVisualization() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function updateSize() {
                if (isRecording) {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                    const scale = 1 + average / 512; // Adjust this value to change the sensitivity
                    audioSphere.style.transform = `scale(${scale})`;
                }
                requestAnimationFrame(updateSize);
            }

            updateSize();
        } catch (error) {
            console.error('Error setting up audio visualization:', error);
        }
    }

    setupAudioVisualization();

    // Reset Conversation Handler (New Session Button)
    newSessionBtn.onclick = async function() {
        // Stop recording if in progress
        if (isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            audioSphere.classList.remove('recording');
        }

        // Stop audio response if playing
        if (isResponding) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            isResponding = false;
            audioSphere.classList.remove('responding');
        }

        // Reset state and UI
        audioChunks = [];
        status.textContent = 'Resetting conversation...';
        audioSphere.style.transform = 'scale(1)';  // Reset sphere size if visualized

        try {
            let response = await fetch('/reset_conversation', {
                method: 'POST'
            });
            if (response.ok) {
                status.textContent = 'New session started. Tap the sphere to start recording';
            } else {
                status.textContent = 'Error resetting conversation';
            }
        } catch (error) {
            console.error('Error:', error);
            status.textContent = 'Error resetting conversation';
        }
    };
});
