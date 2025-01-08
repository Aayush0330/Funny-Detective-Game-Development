let mysteryNumber;
let attempts;
let gameWon;
let guessHistory;
let bestScore = localStorage.getItem('bestScore');
let timeLeft;
let timerInterval;
let streak = 0;
let penalties = 0;

const higherHints = [
    "Informant reports the suspect fled upwards. The number is higher.",
    "Analysis suggests we need to investigate higher values.",
    "Forensics indicates the perp is hiding in a higher location.",
    "My detective instincts say to look above this number.",
    "The evidence points to a higher figure. Keep searching."
];

const lowerHints = [
    "Surveillance footage shows the suspect heading lower.",
    "Witness reports place the number below this point.",
    "The trail leads to a lower value, detective.",
    "My sources say we're aiming too high.",
    "The clues suggest we need to look lower."
];

const successMessages = [
    "Case closed! Brilliant deduction, detective!",
    "Elementary! You've cracked the case!",
    "The suspect is apprehended! Well done!",
    "A masterful investigation! Case solved!",
    "The mystery number has been caught red-handed!"
];

function getRandomHint(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft === 0) {
        endGame(false);
    } else {
        timeLeft--;
    }
}

function endGame(success) {
    clearInterval(timerInterval);
    const guessInput = document.getElementById('guess-input');
    guessInput.disabled = true;
    document.getElementById('submit-btn').disabled = true;
    
    if (!success) {
        document.getElementById('message').textContent = 
            `Game over! The number was ${mysteryNumber}.`;
    }
}

function calculateScore() {
    // Base score starts at 1000
    let score = 1000;
    // Deduct points for each attempt
    score -= attempts * 50;
    // Deduct points for penalties
    score -= penalties * 100;
    // Add points for remaining time
    score += timeLeft * 2;
    // Add streak bonus
    score += streak * 25;
    return Math.max(0, score);
}

function initGame() {
    // Set the range to 1-1000
    const range = 1000;
    mysteryNumber = Math.floor(Math.random() * range) + 1;
    attempts = 0;
    penalties = 0;
    gameWon = false;
    guessHistory = [];
    timeLeft = Math.max(120, 300 - (streak * 30)); // Reduce time with higher streak
    
    document.getElementById('message').textContent = 
        `Detective, we have a new case. A number between 1 and ${range} has gone into hiding. Time: ${Math.floor(timeLeft/60)}min!`;
    document.getElementById('attempts').textContent = attempts;
    document.getElementById('penalties').textContent = penalties;
    document.getElementById('streak').textContent = streak;
    document.getElementById('guess-input').value = '';
    document.getElementById('guess-input').disabled = false;
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('guess-history').innerHTML = '';
    
    if (bestScore) {
        document.getElementById('best-score').textContent = `| Best Score: ${bestScore}`;
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function handleGuess(e) {
    e.preventDefault();
    
    const guessInput = document.getElementById('guess-input');
    const guess = parseInt(guessInput.value);
    const range = 1000; // Fixed range of 1-1000
    
    if (isNaN(guess) || guess < 1 || guess > range) {
        penalties++;
        document.getElementById('penalties').textContent = penalties;
        document.getElementById('message').textContent = 
            `Invalid deduction! -100 points. Valid range: 1-${range}`;
        
        // Check if penalties reached 5
        if (penalties >= 5) {
            endGame(false);
            document.getElementById('message').textContent = 
                `Too many penalties! Game over. The number was ${mysteryNumber}.`;
        }
        return;
    }

    // Check if number was already guessed
    if (guessHistory.includes(guess)) {
        penalties++;
        document.getElementById('penalties').textContent = penalties;
        document.getElementById('message').textContent = 
            'You already investigated this number! -100 points.';
        
        // Check if penalties reached 5
        if (penalties >= 5) {
            endGame(false);
            document.getElementById('message').textContent = 
                `Too many penalties! Game over. The number was ${mysteryNumber}.`;
        }
        return;
    }
    
    attempts++;
    document.getElementById('attempts').textContent = attempts;
    guessHistory.push(guess);
    
    let hint;
    if (guess === mysteryNumber) {
        gameWon = true;
        const score = calculateScore();
        streak++;
        document.getElementById('streak').textContent = streak;
        hint = `${getRandomHint(successMessages)} Score: ${score}`;

        // Update best score for 5 attempts
        if (attempts <= 5 && (!bestScoreFor5 || score > parseInt(bestScoreFor5))) {
            bestScoreFor5 = score;
            localStorage.setItem('bestScoreFor5', score);
            document.getElementById('best-score-for-5').textContent = `| Best Score for 5 Attempts: ${score}`;
        }

        // Update overall best score
        if (!bestScore || score > parseInt(bestScore)) {
            bestScore = score;
            localStorage.setItem('bestScore', score);
            document.getElementById('best-score').textContent = `| Best Score: ${score}`;
        }

        endGame(true);
    } else {
        const difference = Math.abs(mysteryNumber - guess);
        if (guess < mysteryNumber) {
            hint = getRandomHint(higherHints);
            if (difference < 50) hint += " You're getting warm!";
            if (difference < 20) hint += " You're very close!";
        } else {
            hint = getRandomHint(lowerHints);
            if (difference < 50) hint += " You're getting warm!";
            if (difference < 20) hint += " You're very close!";
        }
    }
    
    document.getElementById('message').textContent = hint;
    guessInput.value = '';
    
    const historyItem = document.createElement('div');
    historyItem.className = `history-item`;
    historyItem.innerHTML = `
        <span>Deduction #${attempts}:</span> ${guess}
        <p>${hint}</p>
    `;
    
    document.getElementById('guess-history').insertBefore(historyItem, document.getElementById('guess-history').firstChild);
}

document.getElementById('guess-form').addEventListener('submit', handleGuess);
document.getElementById('new-case').addEventListener('click', initGame);

initGame();