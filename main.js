import { serverApi } from "./config.js";

const startBtn = document.querySelector(".start_btn button");
const boxEl = document.querySelector(".info_box");
const quizBox = document.querySelector(".quiz_box");
const quizContainer = document.querySelector(".quiz_body");
const nextBtn = document.querySelector(".next_btn");
const exitBtn = document.querySelector(".buttons .quit");
const continueBtn = document.querySelector(".buttons .restart");
const audio = document.querySelector("audio");
const timeEl = quizBox.querySelector(".timer .timer_sec");
const timeLine = quizBox.querySelector(".time_line");
const resultEl = document.querySelector(".result_box");
const answers = document.querySelector(".option_list");
const restartEl = resultEl.querySelector(".restart");

let index = 0;
let correctAnswerUser = 0;
let timer;
let timerValue = 15;
let score = 0;
let bonus = 0;
let isCorrect = false;
let userAnswers = [];

let correctEl = `<div class="icon tick"><i class="fas fa-check"></i></div>`;
let incorrectEl = `<div class="icon cross"><i class="fas fa-times"></i></div>`;

async function getData() {
  const res = await fetch(`${serverApi}`);

  if (!res.ok) return;

  const data = await res.json();

  showQuestions(index, data);

  // Start Quiz Event
  startBtn.addEventListener("click", function (e) {
    this.classList.add("hide");
    boxEl.classList.add("active");
  });

  // Exit Quiz Event
  exitBtn.addEventListener("click", function (e) {
    boxEl.classList.remove("active");
    startBtn.classList.remove("hide");
  });

  // Continue Quiz Event
  continueBtn.addEventListener("click", function () {
    boxEl.classList.remove("active");
    quizBox.classList.add("active");
    showQuestions(index, data);
    renderCountQuestions(index, data);
    startTimer(timerValue, data);
  });

  // Next questions

  nextBtn.addEventListener("click", function () {
    if (index < data.length - 1) {
      index++;
      showQuestions(index, data);
      renderCountQuestions(index, data);
      handleTimer(data);

      this.classList.remove("show");
    } else {
      showResult();
    }
  });

  restartEl.addEventListener("click", function () {
    index = 0;
    correctAnswerUser = 0;
    timer;
    timerValue = 15;
    score = 0;
    bonus = 0;
    isCorrect = false;
    userAnswers = [];
    resultEl.classList.remove("active");
    startBtn.classList.remove("hide");
  });

  // Check and choose answer event
  quizBox.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("option") &&
      typeof data[index].answer === "string"
    ) {
      clearInterval(timer);

      let userAnswer = e.target.textContent;
      let correctAnswer = data[index].answer;

      nextBtn.classList.add("show");

      Array.from(e.target.parentElement.children).forEach((answer) =>
        answer.classList.add("disabled")
      );

      const answerCorrect = Array.from(e.target.parentElement.children).find(
        (answer) =>
          answer.textContent.toLowerCase() === correctAnswer.toLowerCase()
      );

      answerCorrect.classList.add("correct");
      answerCorrect.innerHTML = answerCorrect.textContent + correctEl;

      if (convertVn(userAnswer) === convertVn(correctAnswer)) {
        isCorrect = true;
        score += 10;
        correctAnswerUser++;

        audio.setAttribute("src", "./audio/correct-answer.mp3");
        audio.play();
        e.target.classList.add("correct");
        e.target.innerHTML = e.target.textContent + correctEl;
      } else {
        isCorrect = false;
        e.target.classList.add("incorrect");
        e.target.insertAdjacentHTML("beforeend", incorrectEl);
        audio.setAttribute("src", "./audio/wrong-answer.mp3");
        audio.play();
      }

      if (+timeEl.textContent >= 12 && +timeEl.textContent <= 15 && isCorrect) {
        bonus += 5;
      }
    }

    if (
      e.target.classList.contains("option") &&
      Array.isArray(data[index].answer)
    ) {
      let correctAnswer = [
        convertVn(data[index].answer[0]),
        convertVn(data[index].answer[1]),
      ];

      let userAnswer = convertVn(e.target.textContent);

      userAnswers.push(userAnswer);

      if (userAnswers.length === 1) {
        alert("Bạn phải chọn 2 đáp án");
      }

      if (userAnswers.length === 2) {
        clearInterval(timer);
        Array.from(e.target.parentElement.children).forEach((answer) =>
          answer.classList.add("disabled")
        );

        nextBtn.classList.add("show");

        const answerCorrect = Array.from(
          e.target.parentElement.children
        ).filter(
          (answer) =>
            answer.textContent.toLowerCase() ===
              correctAnswer[0].toLowerCase() ||
            answer.textContent.toLowerCase() === correctAnswer[1].toLowerCase()
        );

        answerCorrect.forEach((answer) => {
          answer.classList.add("correct");
          answer.innerHTML = answer.textContent + correctEl;
        });
      }

      if (correctAnswer.includes(userAnswer)) {
        isCorrect = true;
        score += 10;
        e.target.classList.add("correct");
        e.target.innerHTML = e.target.textContent + correctEl;
        audio.setAttribute("src", "./audio/correct-answer.mp3");
        audio.play();
      } else {
        isCorrect = false;
        e.target.classList.add("incorrect");
        e.target.insertAdjacentHTML("beforeend", incorrectEl);
        audio.setAttribute("src", "./audio/wrong-answer.mp3");
        audio.play();
      }

      if (+timeEl.textContent >= 12 && +timeEl.textContent <= 15 && isCorrect) {
        bonus += 5;
      }

      if (
        userAnswers.includes(correctAnswer[0]) &&
        userAnswers.includes(correctAnswer[1])
      ) {
        correctAnswerUser++;
      }
    }
  });

  if (timerValue === 0) {
    const answers = quizContainer.querySelectorAll(".option");
    console.log(answers);
  }
}

getData();

function showQuestions(index, questions) {
  const question = document.querySelector(".que_text");

  let quesHtml = `<span>${questions[index].numb}. ${questions[index].question}</span>`;
  question.innerHTML = quesHtml;
  let answerHtml = `<div class="option">${questions[index].options[0]}</div>
                    <div class="option">${questions[index].options[1]}</div>
                    <div class="option">${questions[index].options[2]}</div>
                    <div class="option">${questions[index].options[3]}</div>
  `;

  question.innerHTML = quesHtml;
  answers.innerHTML = answerHtml;
}

function showResult() {
  boxEl.classList.remove("active");
  quizBox.classList.remove("active");
  resultEl.classList.add("active");

  const scoreEl = resultEl.querySelector(".score_text");
  let scoreHtml = `<span>You answer correct ${correctAnswerUser}/${
    index + 1
  } and you get ${score + bonus}points`;

  scoreEl.innerHTML = scoreHtml;
}

function renderCountQuestions(index, questions) {
  const counterQuestions = quizBox.querySelector(".total_que");
  let totalQuestion = `<span>${index + 1}<p></p>of<p>${
    questions.length
  }</p>Questions</span>`;
  counterQuestions.innerHTML = totalQuestion;
}

function startTimer(time, data) {
  timer = setInterval(() => {
    --time;
    timeEl.textContent = time;

    let percent = Math.floor((time / 15) * 100);
    timeLine.style.width = `${percent}%`;

    if (time <= 0) {
      const answerArr = answers.children;
      Array.from(answerArr).forEach((answer) =>
        answer.classList.add("disabled")
      );

      if (typeof data[index].answer === "string") {
        const answerCorrect = Array.from(answerArr).find(
          (answer) =>
            answer.textContent.toLowerCase() ===
            data[index].answer.toLowerCase()
        );

        answerCorrect.classList.add("correct");
        answerCorrect.innerHTML = answerCorrect.textContent + correctEl;
      } else {
        const answerCorrect = Array.from(answerArr).filter(
          (answer) =>
            answer.textContent.toLowerCase() ===
              data[index].answer[0].toLowerCase() ||
            answer.textContent.toLowerCase() ===
              data[index].answer[1].toLowerCase()
        );

        answerCorrect.forEach((answer) => {
          answer.classList.add("correct");
          answer.innerHTML = answer.textContent + correctEl;
        });
      }

      audio.setAttribute("src", "./audio/wrong-answer.mp3");
      audio.play();

      clearInterval(timer);

      setTimeout(() => {
        nextBtn.classList.add("show");
      }, 1000);
      timeEl.textContent = 0;
    }
  }, 1000);
}

function handleTimer(data) {
  clearInterval(timer);
  timeEl.textContent = 15;
  timerValue = 15;
  timeLine.style.width = `100%`;
  startTimer(timerValue, data);
}

function convertVn(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
