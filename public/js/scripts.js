function getAudio() {
    const videoId = document.getElementById('videoId').value;
    const status = document.getElementById('status');
    const audioPlayer = document.getElementById('audioPlayer');

    if (!videoId) {
        status.textContent = "Please enter a video ID.";
        return;
    }

    status.textContent = "Loading audio...";

    fetch(`/audio?id=${videoId}`)
        .then(response => response.json())
        .then(data => {
            if (data.audioUrl) {
                audioPlayer.src = data.audioUrl;
                audioPlayer.type = 'audio/webm'; //  Set type to audio/webm
                audioPlayer.style.display = 'block';
                audioPlayer.load(); // Load the new source before playing
                audioPlayer.play();
                status.textContent = "Playing audio.";
            } else {
                status.textContent = "Error: Unable to fetch audio URL."; 
            }
        })
        .catch(error => {
            status.textContent = "Error fetching audio.";
            console.error("Error fetching audio:", error);
        });
}