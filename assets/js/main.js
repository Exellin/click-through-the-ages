var resources = document.querySelectorAll(".resource_image_container");

for(var i = 0; i < resources.length; i++) {
  resources[i].addEventListener("click", clickEvents);
}

function clickEvents() {
  animate_resource(this);
  increment_resource(this.id);
}
  
function animate_resource(resourceDiv) {
  var start = null;
  var maxDuration = 600;
  var newResourceImg = document.createElement("img");
  var resourceImg = resourceDiv.querySelector("img");
  var html = document.querySelector("html");
  var maxY = html.clientHeight - resourceImg.clientHeight;
  var startX = resourceImg.getBoundingClientRect().left - 5;
  var startY = resourceImg.getBoundingClientRect().top - 5;
  newResourceImg.src = resourceImg.src;
  newResourceImg.style.position = "absolute";
  resourceDiv.appendChild(newResourceImg);
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
      resourceDiv.removeChild(newResourceImg);
    }
  }
}
    
function increment_resource(resource) {
  var stockpile_id = "#" + resource + "_stockpile";
  var stockpiled_resources = Number(document.querySelector(stockpile_id).textContent) + 1;
  document.querySelector(stockpile_id).textContent = stockpiled_resources;
}
