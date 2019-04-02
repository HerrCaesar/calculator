const inputs = document.querySelectorAll("input");
const primaryDisplay = document.querySelector("h1");
let secondaryDisplay = document.querySelector("h2");
let timer = 0;
let lastOpWasEquals = false;

// When user clicks button, depress button & send its input to be parsed
inputs.forEach(function(button) {
  button.onmousedown = function(event) {
    event.target.classList.add("inset");
    parseInput(event.target.name, false)
  }
})

// Clicks anywhere bubbles to doc, and all depressed buttons are undepressed
document.onmouseup = function() {
  inputs.forEach(function(button) {
    button.classList.remove("inset");
  })
}

// Pressing keyboard key sends its value to be parsed every 0.4 seconds
document.onkeydown = function(event) {
  // Prevent baskspace from navigating back in browser history
  if(event.key == "Backspace")
  {
    event.preventDefault();
  }
  timer = setInterval(parseInput(event.key, true), 3000);
}

// Releasing keyboard button stops it from sending its value for parsing
document.onkeyup = function() {
  clearInterval(timer);
  inputs.forEach(function(button) {
    button.classList.remove("inset");
  })
}

// Converts synonymous keyboard symbols and sends input to relevant function
function parseInput(char, keyboard)
{
  switch(char)
  {
    case "%":
      char = "/";
      showOnKeypad(char);
      operator(char);
      return;
    case "x":
    case "X":
      char = "*";
      showOnKeypad(char);
      operator(char);
      return;
  }

  if(/[\d\.]/.test(char))
  {
    if(keyboard)
    {
      showOnKeypad(char);
    }
    digit(char);
  }
  else if(/[\+\-\*\/]/.test(char)) 
  {
    if(keyboard)
    {
      showOnKeypad(char);
    }
    operator(char);
  }

  switch(char)
  {
    case "=":
    case "Enter":
      if(keyboard)
      {
        showOnKeypad("=");
      }
      compute();
    break;
    case "Delete":
    case "Backspace":
      if(keyboard)
      {
        showOnKeypad("Delete");
      }
      backSpace();
      break;
    case "c":
    case "C":
      if(keyboard)
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
      break;
  }
}

/* Move current input into secondary display (adding one if neccessary)
and reset primary display */
function operator(op)
{
  if(lastOpWasEquals)
  {
    secondaryDisplay.textContent = "(" + secondaryDisplay.textContent.replace(/(?== $)/, ") ");
    primaryDisplay.textContent = "0";
    lastOpWasEquals = false;
  }
  let display = primaryDisplay.textContent;
  let displayTwo = secondaryDisplay.textContent;
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
  if (display !== "0")
  {
    secondaryDisplay.textContent += display + " " + op + " "; 
  }
  else if(displayTwo)
  {
    secondaryDisplay.textContent = displayTwo.replace(/[\+\-\*\/=] $/, op + " ");
  }
  primaryDisplay.textContent = "0";
}

// Add digit to end of primary display (replacing '0' if present)
function digit(dig)
{
  if(lastOpWasEquals)
  {
    allClear();
    lastOpWasEquals = false;
  }
  let display = primaryDisplay.textContent;
  if(dig === "." && /\./.test(display))
  {
    return;
  }
  if(display === "0")
  {
    if(dig === ".")
    {
      primaryDisplay.textContent += dig;
    }
    else
    {
      primaryDisplay.textContent = dig;
    }
  }
  else if(display.length > 17)
  {
    return;
  }
  else
  {
    primaryDisplay.textContent += dig;
  }
}

/* Move input to secondary display; compute result of string now in secondary
display and print it in primary display */
function compute()
{
  operator("=");
  // Last character is '='
  let newCont = secondaryDisplay.textContent.replace(/[\s=]/g, "")
  primaryDisplay.textContent = eval(newCont);
  lastOpWasEquals = true;
}

// Delete one digit from end of primary display
function backSpace()
{
  let display = primaryDisplay.textContent;
  if(lastOpWasEquals)
  {
    allClear();
    lastOpWasEquals = false;
  }
  if(display != 0)
  {
    let len = display.length;
    if(len === 1)
    {
      primaryDisplay.textContent = "0";
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
  primaryDisplay.textContent = "0";
}

// Remove secondary display and call clear
function allClear()
{
  secondaryDisplay.textContent = "";
  clear();
}

// Inset calculator button corresponding to keyboard button
function showOnKeypad(char)
{
  document.getElementsByName(char)[0].classList.add("inset");
}