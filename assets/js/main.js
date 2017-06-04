var gameState = setDefaults();

function setDefaults() {
  var defaults = {
    resources : { 
      stone : {
        name: "stone",
        total: 0,
        storage: 1000
      },
      food : {
        name: "food",
        total: 0,
        storage: 1000
      },
      wood: {
        name: "wood",
        total: 0,
        storage: 1000
      }
    },
    buildings : {
      farm: {
        name: "farm",
        total: 0,
        wood_cost: 10,
        food_rate: 2,
        worked: 0
      },
      quarry: {
        name: "quarry",
        total: 0,
        stone_cost: 10,
        stone_rate: 2,
        worked: 0
      },
      lumberCamp: {
        name: "lumberCamp",
        total: 0,
        wood_cost: 10,
        wood_rate: 2,
        worked: 0
      },
      population: {
        name: "population",
        total: 0,
        food_cost: 10,
        food_rate: -1,
        storage: 0
      },
      hut: {
        name: "hut",
        total: 0,
        stone_cost: 10,
        population: 2
      }
    }
  };
  return defaults;
}

window.setInterval(function() {
  addResources();
  save();
  updateDisplay();
}, 1000);

initialize();

function initialize() {
  load();

  var resourceImageContainers = document.querySelectorAll(".resource_image_container");
  for(var i = 0; i < resourceImageContainers.length; i++) {
    resourceImageContainers[i].addEventListener("click", resourceClickEvents);
  }
  
  var buildingContainers = document.querySelectorAll(".building");
  for (var i = 0; i < buildingContainers.length; i++) {
    buildingContainers[i].addEventListener("click", purchaseBuilding);
  }
  
  var assignButtons = document.querySelectorAll(".assign");
  for (var i = 0; i < assignButtons.length; i++) {
    assignButtons[i].addEventListener("click", assignWorker);
  }
  
  var removeButtons = document.querySelectorAll(".remove");
  for (var i = 0; i < assignButtons.length; i++) {
    removeButtons[i].addEventListener("click", removeWorker);
  }
  
  document.querySelector("#save").addEventListener("click", save);
  document.querySelector("#delete").addEventListener("click", deleteSave);
}

function assignWorker() {
  var buildingName = this.id.substring(0, this.id.indexOf('_'));
  var unemployed = calculateUnemployed();
  if (gameState.buildings[buildingName].worked < gameState.buildings[buildingName].total && unemployed > 0) {
    gameState.buildings[buildingName].worked += 1;
    calculateUnemployed();
    updateDisplay();
  }
}

function removeWorker() {
  var buildingName = this.id.substring(0, this.id.indexOf('_'));
  if (gameState.buildings[buildingName].worked > 0) {
    gameState.buildings[buildingName].worked -= 1;
    calculateUnemployed();
    updateDisplay();
  }
}

function resourceClickEvents() {
  var resourceName = this.id;
  animateResource(this);
  incrementResource(gameState.resources[resourceName]);
}

function purchaseBuilding() {
  var buildingName = this.id;
  var canPurchase = true;
  
  Object.keys(gameState.resources).forEach(function(resourceName) {
    var resourceCost = gameState.buildings[buildingName][resourceName + "_cost"];
    var resourceTotal = gameState.resources[resourceName].total;
    if (resourceCost && canPurchase === true) {
      if (resourceTotal < resourceCost) {
        canPurchase = false;
      }
    }
  });
  
  if (canPurchase === true) {
    var maxPopulation = calculateMaxPopulation();
    Object.keys(gameState.resources).forEach(function(resourceName) {
      var resourceCost = gameState.buildings[buildingName][resourceName + "_cost"];
      if (resourceCost) {
        if (buildingName === "population") {
          if (gameState.buildings[buildingName].total < maxPopulation) {
            gameState.resources[resourceName].total -= resourceCost;
            gameState.buildings[buildingName][resourceName + "_cost"] += 10;
          }
        } else {
          gameState.resources[resourceName].total -= resourceCost;
          gameState.buildings[buildingName][resourceName + "_cost"] += 10;
        }
        updateDisplay();
      }
    });
    if (buildingName === "population") {
       if (gameState.buildings[buildingName].total < maxPopulation) {
          gameState.buildings[buildingName].total += 1;
       }
    } else {
      gameState.buildings[buildingName].total += 1;
    }
    updateDisplay();
  }
}
  
function animateResource(resourceImageContainer) {
  var start = null;
  var maxDuration = 600;
  var newResourceImg = document.createElement("img");
  var resourceImg = resourceImageContainer.querySelector("img");
  var html = document.querySelector("html");
  var maxY = html.clientHeight - resourceImg.clientHeight;
  var startX = resourceImg.getBoundingClientRect().left - 5;
  var startY = resourceImg.getBoundingClientRect().top - 5  + window.pageYOffset;
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
  resource.total += 1;
  updateDisplay();
}

function updateDisplay() {
  var propertiesToUpdate = ["total", "storage", "wood_cost", "wood_rate", "food_cost", "food_rate",
                          "stone_cost", "stone_rate", "worked", "population"];
  Object.keys(gameState).forEach(function(category) {
    propertiesToUpdate.forEach(function(propery) {
      setProperty(gameState[category], propery);
    });
  });

  Object.keys(gameState.resources).forEach(function (resourceName) {
    calculateResourceRate(resourceName);
  });
  
  calculateMaxPopulation();
  
  function setProperty(category, property) {
    Object.keys(category).forEach(function(key) {
      if (category[key][property] !== undefined) {
        document.querySelector("#" + category[key].name + "_" + property).textContent = category[key][property];
      }
    });
  }
}

function save() {
  try {
    window.localStorage.setItem("save", JSON.stringify(gameState));
    if (this.id === "save") {
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
    gameState = savegame;
  }
  updateDisplay();
}

function deleteSave() {
  if (window.confirm("Are you sure you want to delete your save?")) {
    window.localStorage.removeItem("save");
    gameState = setDefaults();
    updateDisplay();
  }
}

function addResources() {
  Object.keys(gameState.resources).forEach(function(resourceName){
    gameState.resources[resourceName].total += calculateResourceRate(resourceName);
  });
}

function calculateResourceRate(resourceName) {
  var resourcesPerTick = 0;
  Object.keys(gameState.buildings).forEach(function(buildingName) {
    if (gameState.buildings[buildingName][resourceName + "_rate"]) {
      if (buildingName === "population") {
        resourcesPerTick += gameState.buildings[buildingName][resourceName + "_rate"] * gameState.buildings[buildingName].total;
      } else {
        resourcesPerTick += gameState.buildings[buildingName][resourceName + "_rate"] * gameState.buildings[buildingName].worked;
      }
      document.querySelector("#" + resourceName + "_rate").textContent = resourcesPerTick;
    }
  });
  if (resourcesPerTick > (gameState.resources[resourceName].storage - gameState.resources[resourceName].total)) {
    resourcesPerTick = gameState.resources[resourceName].storage - gameState.resources[resourceName].total;
  }
  else if (resourcesPerTick < (0 - gameState.resources[resourceName].total)) {
    resourcesPerTick = 0 - gameState.resources[resourceName].total;
  }
  return resourcesPerTick;
}

function calculateMaxPopulation() {
  var maxPopulation = 0;
  Object.keys(gameState.buildings).forEach(function(buildingName) {
    if (gameState.buildings[buildingName].population) {
      maxPopulation += gameState.buildings[buildingName].population * gameState.buildings[buildingName].total;
      document.querySelector("#population_storage").textContent = maxPopulation;
    }
  });
  calculateUnemployed();
  return maxPopulation;
}

function calculateUnemployed() {
  var employed = 0;
  Object.keys(gameState.buildings).forEach(function(buildingName) {
    if (gameState.buildings[buildingName].worked) {
      employed += gameState.buildings[buildingName].worked;
    }
  });
  var unemployed = gameState.buildings.population.total - employed;
  document.querySelector("#population_unemployed").textContent = unemployed;
  return unemployed;
}