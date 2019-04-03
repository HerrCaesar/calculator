const inputs = document.querySelectorAll("input");
const primaryDisplay = document.querySelector("h1");
let expressionDisplay = document.querySelector("h2");
let timer = 0;
let blinking = 0;
let lastKeyWasEquals = false;

// Make cursor blink until user enters input
makeBlink();
function makeBlink()
{
  blinking = setInterval(function() {
    primaryDisplay.classList.toggle("invisible")
  }, 500)
}

// When user clicks button, depress button & send its input to be parsed
inputs.forEach(function(button) {
  button.onmousedown = function(event) {
    event.target.classList.add("inset");
    parseInput(event.target.name, false)
  }
})

// Releasing mouse button anywhere bubbles to doc: inset buttons are outset
document.onmouseup = function() {
  inputs.forEach(function(button) {
    button.classList.remove("inset");
  })
}

// Pressing keyboard key sends its value to be parsed every 0.5 seconds
document.onkeydown = function(event) {
  // Prevent baskspace from navigating back in browser history
  if (event.key == "Backspace")
  {
    event.preventDefault();
  }
  timer = setInterval(parseInput(event.key, true), 500);
}

// Release keyboard button to stop it sending its value for parsing
document.onkeyup = function() {
  clearInterval(timer);
  inputs.forEach(function(button) {
    button.classList.remove("inset");
  })
}

// Check entry; simulate button press if input keyed; pass to relevant function
function parseInput(char, keyboard)
{
  // Convert keyboard symbols synonymous to displayed symbols
  switch(char)
  {
    case "%":
      char = "\xF7";
      showOnKeypad(char);
      operator(char);
      return;
    case "*":
    case "X":
      char = "x";
      showOnKeypad(char);
      operator(char);
      return;
  }
  // Digits and decimal points
  if (/[\d\.]/.test(char))
  {
    if (keyboard)
    {
      showOnKeypad(char);
    }
    digit(char);
  }
  // Operators other than '='
  else if (/(\xF7|[\+\-x])/u.test(char)) 
  {
    if (keyboard)
    {
      showOnKeypad(char);
    }
    operator(char);
  }
  // Look for all other inputs
  switch(char)
  {
    case "=":
    case "Enter":
      if (keyboard)
      {
        showOnKeypad("=");
      }
      compute();
    break;
    case "Delete":
    case "Backspace":
      if (keyboard)
      {
        showOnKeypad("Delete");
      }
      backSpace();
      break;
    case "c":
    case "C":
      if (keyboard)
      {
        showOnKeypad("C");
      }
      clear();
      break
    case "AC":
      allClear();
      break
    default:
      return;
  }
}

// Move current input into expression display (above the primary display)
function operator(op)
{
  /* If previous key pressed was '=', user wants to use the output as an 
  operand. For nicer UX, wrap previous expression in brackets first (the '='
  will be removed later). */
  if (lastKeyWasEquals)
  {
    expressionDisplay.textContent = "(" + 
      expressionDisplay.textContent.replace(/(?== $)/, ") ");
    primaryDisplay.textContent = "\u275A";
    lastKeyWasEquals = false;
  }
  let display = primaryDisplay.textContent;
  let displayTwo = expressionDisplay.textContent;
  // To simplify expression display, remove any trailing decimal points/zeroes
  if (/\./.test(display))
  {
    while (display.substring(display.length - 1) == "0")
    {
      display = display.substring(0, display.length - 1);
    }
    if (display.substring(display.length - 1) == ".")
    {
      display = display.substring(0, display.length - 1);
    }
  }
  // Append input number, then operation symbol to expression; pad with spaces
  if (!/\u{275A}/u.test(display))
  {
    expressionDisplay.textContent += display + " " + op + " "; 
  }
  // If user didn't input number, let them change previously entered operator
  else if (displayTwo)
  {
    expressionDisplay.textContent = displayTwo.replace(/(\xF7|[\+\-x=]) $/, op + " ");
  }
  primaryDisplay.textContent = "\u275A";
  makeBlink();
}

// Add digit to end of primary display (replace '0' if present)
function digit(dig)
{
  // Make sure display isn't blinking
  clearInterval(blinking);
  primaryDisplay.classList.remove("invisible");
  // Clear both displays if user returns expression & then inputs new number
  if (lastKeyWasEquals)
  {
    allClear();
    lastKeyWasEquals = false;
  }
  // Ignore additional decimal points & don't let inputs make display overflow
  let display = primaryDisplay.textContent;
  if (dig === "." && /\./.test(display) || display.length > 17)
  {
    return;
  }
  // If content already in display, add to it
  else if (!/\u{275A}/u.test(display))
  {
    primaryDisplay.textContent += dig;
  }
  // Put 0 to left of leading decimal point
  else if (/\u{275A}/u.test(display) && dig === ".")
  {
    primaryDisplay.textContent = "0" + dig;
  }
  // Otherwise replace the curser |
  else
  {
    primaryDisplay.textContent = dig;
  }
}

// Delete one digit from end of primary display
function backSpace()
{
  let display = primaryDisplay.textContent;
  if (lastKeyWasEquals)
  {
    allClear();
    lastKeyWasEquals = false;
  }
  if (!/\u{275A}/u.test(display))
  {
    let len = display.length;
    if (len === 1)
    {
      primaryDisplay.textContent = "\u275A";
      makeBlink();
    }
    else
    {
      primaryDisplay.textContent = display.substring(0, len - 1);
    }
  }
}

// Replace primary display with '0'
function clear()
{
  primaryDisplay.textContent = "\u275A";
  makeBlink();
}

// Remove expression display and call clear
function allClear()
{
  expressionDisplay.textContent = "";
  clear();
}

/* Move input to expression display; compute result of string now in
expression display and print it in primary display */
function compute()
{
  operator("=");
  // Make sure display isn't blinking
  clearInterval(blinking);
  primaryDisplay.classList.remove("invisible");
  // Last char is '='; remove it & all spaces, then send to evaluate; print
  primaryDisplay.textContent = 
    evaluate(expressionDisplay.textContent.replace(/[\s=]/g, ""));
  // Set global flag in case user keeps calculating (used elsewhere)
  lastKeyWasEquals = true;
}

// Do the maths
function evaluate(exp)
{
  /* Do bracketed expressions first, recursively calling evaluate until 
  replaced with single expression */
  if (exp.substr(0,1) === "(")
  {
    let regex = /\((.*)\)/.exec(exp);
    exp = exp.replace(regex[0], evaluate(regex[1]));
  }
  // Check for returning infinity from dividion by 0 inside bracket
  if (exp.match("Infinity"))
  {
    return "Infinity";
  }
  /* Next do multiplication and division in order encountered; simplify each
  binary product/division to a number until only pluses and minuses remain */
  let prodRgx = /(\d*)(\xF7|x)(\d*)/u;
  for (let prodArr = prodRgx.exec(exp); prodArr; prodArr = prodRgx.exec(exp))
  {
    switch(prodArr[2])
    {
      case "x":
      exp = exp.replace(prodArr[0], multiply(+prodArr[1], +prodArr[3]));
      break;
      case "\xF7":
      exp = exp.replace(prodArr[0], divide(+prodArr[1], +prodArr[3]));
      break;
    }
    // If divided by 0
    if (exp === "Infinity")
    {
      return exp;
    }
  }
  /* Finally do addition and subtraction in order encountered; simplify each 
  binary addition/subtraction to a number until only numbers remain */
  let sumRgx = /(\d*)([\+\-])(\d*)/;
  for (let sumArr = sumRgx.exec(exp); sumArr; sumArr = sumRgx.exec(exp))
  {
    switch(sumArr[2])
    {
      case "-":
      sumArr[3] = -sumArr[3]
      case "+":
      exp = exp.replace(sumArr[0], add(+sumArr[1], +sumArr[3]));
      break;
    }
  }
  return exp;
}

function add(x,y)
{
  return x + y;
}

function multiply(x,y)
{
  return x * y;
}

function divide(x,y)
{
  if (y === 0)
  {
    return "Infinity";
  }
  return x / y;
}

// Inset calculator button corresponding to keyboard button
function showOnKeypad(char)
{
  document.getElementsByName(char)[0].classList.add("inset");
}