function initScrambleEffect() {
    const headerLink = document.getElementById('header-link');
    const chars = headerLink.querySelectorAll('span');

    chars.forEach(char => {
        char.addEventListener('mouseover', () => {
            if (!char.scrambleInterval) {
                scrambleChar(char, char.textContent);
            }
        });
    });

    function scrambleChar(char, originalChar) {
        char.scrambleInterval = setInterval(() => {
            const randomChar = getRandomChar();
            char.textContent = randomChar;

            if (randomChar === originalChar) {
                stopScrambling(char);
            }
        }, 50);

        // Set a timeout to revert back to the original character after 3 seconds
        char.scrambleTimeout = setTimeout(() => stopScrambling(char, originalChar), 3000);
    }

    function stopScrambling(char, originalChar = null) {
        clearInterval(char.scrambleInterval);
        clearTimeout(char.scrambleTimeout);
        char.scrambleInterval = null;
        char.scrambleTimeout = null;

        if (originalChar) {
            char.textContent = originalChar;
        }
    }

    function getRandomChar() {
        const asciiStart = 33;
        const asciiEnd = 126;
        return String.fromCharCode(Math.floor(Math.random() * (asciiEnd - asciiStart) + asciiStart));
    }
}
initScrambleEffect();
