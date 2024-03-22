let questions = []; // Declare the questions array

fetch('https://opentdb.com/api.php?amount=10')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.response_code !== 0) {
            throw new Error('Invalid response code');
        }
        // Map the data results to the questions array
        questions = data.results.map(result => ({
            question: result.question,
            choices: [result.correct_answer, ...result.incorrect_answers],
            correctAnswer: result.correct_answer,
            difficulty: result.difficulty.toLowerCase() // Ensure the difficulty is converted to lowercase
        }));
        // Now you can use the questions array
        console.log(questions);
        
        // If you need to perform further operations with questions, do it here
        // For example, you can start the game after fetching and processing the questions
        startGame();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

let currentQuestionIndex = 0;
let points = 0;
let gameTimer;
let gameSecondsLeft = 600; // 10 minutes in seconds

function startGame() {
    document.getElementById("start-game-container").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    resetStatusText();
    resetPoints();
    showQuestion();
    startGameTimer();
}

function resetPoints() {
    points = 0;
    updatePointsText();
}

function resetStatusText() {
    document.getElementById("status-text").innerText = "Current status: ";
}

function showQuestion() {
    const questionContainer = document.getElementById("question-container");
    const currentQuestion = questions[currentQuestionIndex];

    questionContainer.innerHTML = `<p>${currentQuestion.question}</p>`;

    currentQuestion.choices.forEach((choice, index) => {
        const choiceElement = document.createElement("div");
        choiceElement.className = "choice";
        choiceElement.innerHTML = `
      <input type="radio" name="answer" value="${index}" id="choice${index}">
      <label for="choice${index}">${choice}</label>
    `;
        questionContainer.appendChild(choiceElement);
    });

    updateQuestionsLeftText();
    enableNextButton();
}

function nextQuestion() {
    const selectedChoice = document.querySelector(
        'input[name="answer"]:checked'
    );

    if (selectedChoice) {
        const choiceIndex = selectedChoice.value;
        const currentQuestion = questions[currentQuestionIndex];

        if (
            currentQuestion.choices[choiceIndex] ===
            currentQuestion.correctAnswer
        ) {
            let pointsForQuestion = calculatePoints(currentQuestion.difficulty);
            points += pointsForQuestion;
            updatePointsText();
            showStatus(
                `Correct! Well done! You earned ${pointsForQuestion} points.`
            );
        } else {
            points -= 5; // Lose 5 points for the wrong answer
            updatePointsText();
            showStatus("Incorrect! Try harder!");
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            endGame();
        }
    } else {
        showStatus("Please select an answer!");
    }
}

function calculatePoints(difficulty) {
    switch (difficulty) {
        case "easy":
            return 10;
        case "medium":
            return 20;
        case "hard":
            return 40;
        default:
            return 0;
    }
}

function updatePointsText() {
    document.getElementById("points-text").innerText = `Points: ${points}`;
}

function updateQuestionsLeftText() {
    const questionsLeft = Math.max(
        0,
        questions.length - currentQuestionIndex - 1
    );
    document.getElementById(
        "questions-left-text"
    ).innerText = `Questions left: ${questionsLeft}`;
}

function showStatus(message) {
    document.getElementById(
        "status-text"
    ).innerText = `Current status: ${message}`;
}

function endGame() {
    showStatus(`Game Over! You scored ${points} points.`);
    disableNextButton();
    clearInterval(gameTimer);

    setTimeout(() => {
        document.getElementById("game-container").style.display = "none";
        document.getElementById("start-game-container").style.display =
            "block";
        currentQuestionIndex = 0;
        gameSecondsLeft = 600;
        document.getElementById("next-button").disabled = true;
        document.getElementById("timer-text").innerText = `Time left: 10:00`;
    }, 4000); // 4-second delay
    // Additional end game logic if needed
}

function enableNextButton() {
    document.getElementById("next-button").disabled = false;
}

function disableNextButton() {
    document.getElementById("next-button").disabled = true;
}

function startGameTimer() {
    gameTimer = setInterval(function () {
        gameSecondsLeft--;
        updateGameTimerText();

        if (gameSecondsLeft === 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }, 1000);
}

function updateGameTimerText() {
    const minutes = Math.floor(gameSecondsLeft / 60);
    const seconds = gameSecondsLeft % 60;
    document.getElementById(
        "timer-text"
    ).innerText = `Time left: ${formatTime(minutes)}:${formatTime(
        seconds
    )}`;
}

function formatTime(value) {
    return value < 10 ? `0${value}` : value;
}


