var gameState = {
    resources : { stone : 0, food : 0 }
};

window.setInterval(function() {
  save();
}, 1000);

initialize();

function initialize() {
  load();
  updateDisplay();

  var resourceImageContainers = document.querySelectorAll(".resource_image_container");
  for(var i = 0; i < resourceImageContainers.length; i++) {
    resourceImageContainers[i].addEventListener("click", clickEvents);
  }
  
  document.querySelector("#save").addEventListener("click", save);
  document.querySelector("#delete").addEventListener("click", deleteSave);
}

function clickEvents() {
  animateResource(this);
  incrementResource(this.id.substring(0, this.id.indexOf('_')));
}
  
function animateResource(resourceImageContainer) {
  var start = null;
  var maxDuration = 600;
  var newResourceImg = document.createElement("img");
  var resourceImg = resourceImageContainer.querySelector("img");
  var html = document.querySelector("html");
  var maxY = html.clientHeight - resourceImg.clientHeight;
  var startX = resourceImg.getBoundingClientRect().left - 5;
  var startY = resourceImg.getBoundingClientRect().top - 5;
  newResourceImg.src = resourceImg.src;
  newResourceImg.style.position = "absolute";
  resourceImageContainer.appendChild(newResourceImg);
  var progress, x, y;
  requestAnimationFrame(step);
  
  function step(timestamp) {
    if (!start) start = timestamp;
    progress = (timestamp - start)/maxDuration;
    x = progress*Math.sqrt(maxY, 2) + startX;
    y = Math.pow((x-startX), 2) + startY;
    newResourceImg.style.left = x + "px";
    newResourceImg.style.top = y + "px";
    if (y < maxY && progress < 1) {
      window.requestAnimationFrame(step);
    }
    else {
      resourceImageContainer.removeChild(newResourceImg);
    }
  }
}
    
function incrementResource(resource) {
  gameState.resources[resource] += 1;
  updateDisplay();
}

function updateDisplay() {
  Object.keys(gameState).forEach(function(category) {
    loop(gameState[category]);
  });

  function loop(category) {
    Object.keys(category).forEach(function(key) {
      document.querySelector("#" + key).textContent = category[key];
    });
  }
}

function save() {
  try {
    window.localStorage.setItem("save",JSON.stringify(gameState));
    if (this.textContent === "Save Game") {
      alert("Manually saved the game");
    }
  } catch(err) {
    console.log("Cannot save to localStorage");
  }
}

function load() {
  try {
    var savegame = JSON.parse(window.localStorage.getItem("save"));
  } catch(err) {
    console.log('Cannot load from localStorage');
  }
  
  if (savegame) {
    Object.keys(gameState).forEach(function(category) {
      setProperties(gameState[category], savegame[category]);
    });
  }
  
  function setProperties(category, savegameCategory) {
    Object.keys(category).forEach(function(key) {
      if (typeof(savegameCategory[key]) !== undefined)  category[key] = savegameCategory[key];
    });
  }
}

function deleteSave() {
  if (window.confirm("Are you sure you want to delete your save?")) {
    window.localStorage.removeItem("save");
    Object.keys(gameState).forEach(function(category) {
      setToZero(gameState[category]);
    });
    updateDisplay(gameState);
  }
  
  function setToZero(category) {
    Object.keys(category).forEach(function(key) {
      category[key] = 0;
    });
  }
}
