
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const keypad = document.querySelector(".keypad");

let currentInput = "0";
let previousValue = null;
let operator = null;
let waitingForNext = false;
let justCalculated = false;
let errorState = false;

function updateDisplay() {
  resultDisplay.textContent = currentInput;

  if (errorState) {
    expressionDisplay.textContent = "Invalid calculation";
  } else if (operator !== null && previousValue !== null) {
    expressionDisplay.textContent =
      `${previousValue} ${operator}`;
  } else if (justCalculated) {
    expressionDisplay.textContent = "Result";
  } else {
    expressionDisplay.textContent = "Ready to calculate";
  }
}

function clearCalculator() {
  currentInput = "0";
  previousValue = null;
  operator = null;
  waitingForNext = false;
  justCalculated = false;
  errorState = false;
  updateDisplay();
}

function showError(message) {
  currentInput = message;
  previousValue = null;
  operator = null;
  waitingForNext = false;
  justCalculated = false;
  errorState = true;
  updateDisplay();
}

function enterNumber(number) {
  if (errorState || justCalculated) {
    clearCalculator();
  }

  if (waitingForNext) {
    currentInput = number;
    waitingForNext = false;
  } else if (currentInput === "0") {
    currentInput = number;
  } else if (currentInput === "-0") {
    currentInput = "-" + number;
  } else if (currentInput.length < 16) {
    currentInput += number;
  }

  updateDisplay();
}

function enterDecimal() {
  if (errorState || justCalculated) {
    clearCalculator();
  }

  if (waitingForNext) {
    currentInput = "0.";
    waitingForNext = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }

  updateDisplay();
}

function deleteLast() {
  if (errorState || justCalculated) {
    clearCalculator();
    return;
  }

  if (waitingForNext) return;

  currentInput = currentInput.length > 1
    ? currentInput.slice(0, -1)
    : "0";

  if (currentInput === "-") currentInput = "0";

  updateDisplay();
}

function toggleSign() {
  if (errorState) {
    clearCalculator();
    return;
  }

  if (waitingForNext) {
    currentInput = "-0";
    waitingForNext = false;
  } else {
    currentInput = currentInput.startsWith("-")
      ? currentInput.slice(1)
      : "-" + currentInput;
  }

  justCalculated = false;
  updateDisplay();
}

function calculate(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      if (b === 0) {
        return null;
      }
      return a / b;
    default:
      return b;
  }
}

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    return null;
  }

  const rounded = Number(number.toPrecision(12));

  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function chooseOperator(nextOperator) {
  if (errorState) {
    clearCalculator();
    return;
  }

  const inputValue = Number(currentInput);

  if (!Number.isFinite(inputValue)) {
    showError("Invalid input");
    return;
  }

  if (operator !== null && !waitingForNext) {
    const result = calculate(
      previousValue,
      inputValue,
      operator
    );

    if (result === null) {
      showError("Cannot divide by 0");
      return;
    }

    const formatted = formatNumber(result);

    if (formatted === null) {
      showError("Result too large");
      return;
    }

    currentInput = formatted;
    previousValue = result;
  } else {
    previousValue = inputValue;
  }

  operator = nextOperator;
  waitingForNext = true;
  justCalculated = false;
  updateDisplay();
}

function calculateResult() {
  if (errorState) return;

  if (operator === null || previousValue === null) {
    return;
  }

  if (waitingForNext) {
    showError("Enter a number");
    return;
  }

  const a = previousValue;
  const b = Number(currentInput);
  const op = operator;
  const result = calculate(a, b, op);

  if (result === null) {
    showError("Cannot divide by 0");
    return;
  }

  const formatted = formatNumber(result);

  if (formatted === null) {
    showError("Result too large");
    return;
  }

  expressionDisplay.textContent = `${a} ${op} ${b} =`;
  currentInput = formatted;
  resultDisplay.textContent = currentInput;

  previousValue = null;
  operator = null;
  waitingForNext = false;
  justCalculated = true;
  errorState = false;
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) {
    enterNumber(button.dataset.number);
    return;
  }

  if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
    return;
  }

  switch (button.dataset.action) {
    case "clear":
      clearCalculator();
      break;
    case "delete":
      deleteLast();
      break;
    case "decimal":
      enterDecimal();
      break;
    case "sign":
      toggleSign();
      break;
    case "equals":
      calculateResult();
      break;
  }
});

// Keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    enterNumber(key);
  } else if (key === ".") {
    enterDecimal();
  } else if (key === "+") {
    chooseOperator("+");
  } else if (key === "-") {
    chooseOperator("−");
  } else if (key === "*") {
    chooseOperator("×");
  } else if (key === "/") {
    event.preventDefault();
    chooseOperator("÷");
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearCalculator();
  }
});

updateDisplay();
