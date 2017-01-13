var myGamePiece;
var doodads = new Array();
var doodadArts = new Array();
var sourceArts = new Array();
var worldState = new Array();
var actions = new Array();
var changesList = new Array();


function gameStart() {

//myGamePiece = new component(30, 30, "red", 10, 120);
    myGamePiece = new character("media/1.png", 10.0, 120.0, 8, 2.0);
    sourceArts["miscDoodads"] = new sourceArt("media/obj_misk_atlas.png");
    doodadArts["wood"] = new doodadArt("miscDoodads", 1, 12);
    doodadArts["chicken"] = new doodadArt("miscDoodads", 1, 26);
    doodads.push( new doodad(20, 50, "wood") );
    doodads.push( new doodad(50, 30, "wood") );
    doodads.push( new doodad(70, 200, "chicken") );
    worldState["hunger"] = 30.0;
    worldState["hungerAmp"] = 100.0;
    worldState["food"] = 0.0;
    worldState["chicken"] = 0.0;
    worldState["money"] = 20.0;
    worldState["moneyAmp"] = 0.50;
    changesList["hunger"] = 20.0;
    
    //changesList["money"] = -10.0;
    //changesList["test"] = 5.0;
    actions["eatFood"] = new action("eat food",{food:1.0},{food:-1.0,hunger:20.0});
    actions["cookChicken"] = new action("cook chicken",{chicken:1.0,hunger:1.0},{chicken:-1.0,food:4.0, hunger:-1.0});
    actions["sellFood"] = new action("sell food",{food:1.0},{food:-1.0,money:10.0});
    actions["buyFood"] = new action("buy food",{money:20.0},{food:1.0,money:-20.0});
    actions["doWork"] = new action("do work",{hunger:5.0},{hunger:-5.0,money:20.0});
    actions["buyChicken"] = new action("buyChicken",{money:50.0},{chicken:1.0,money:-50.0});
    
    myGameArea.start();
}
          
var myGameArea = {
    canvas : document.getElementById("gameArea"),
    output : document.getElementById("textArea"),
    start : function() {
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        //var test = myGamePiece.applyChanges(worldState, changesList);
        var testPlan = myGamePiece.makeForwardPlan(worldState, actions);
        var printout = "";
        while (testPlan["actions"].length > 0) { printout += ", " + testPlan["actions"].pop().name }
        this.output.innerHTML = "my chosen action is " + printout;
        this.interval = setInterval(updateGameArea, 17);
        
    },
    
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function(){
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
}

function sourceArt(imageSrc) {
    this.image = new Image(1024, 1024);
    this.image.src = imageSrc;
    
    this.getImage = function(){
        return this.image;
    }
}

function doodadArt(doodadImage, x, y) {
    this.image = doodadImage;
    this.width = 32;
    this.height = 32;
    this.x = x * this.width;
    this.y = y * this.height;
    
    this.getImage = function (){
        return sourceArts[this.image].getImage();
    }
}
              
function doodad(x, y, art) {
    this.x = x;
    this.y = y;
    this.art = art;
    this.getImage = function(){
        return doodadArts[this.art].getImage();
    }
    this.update = function(){
        ctx = myGameArea.context;
        ctx.drawImage(this.getImage(), doodadArts[this.art].x, doodadArts[this.art].y, 32, 32, this.x, this.y, 32, 32);
    }
    
}

function action(name, requirements, changes) {
    this.name = name;
    this.requirements = requirements;
    this.changes = changes;
}

function character(charImage, x, y, attention, speed) {
    this.image = new Image(96, 128);
    this.image.src = charImage;
    this.width = 32;
    this.height = 32;
    this.x = x;
    this.y = y;
    this.attention = attention;
    this.speed = speed;
    this.update = function(){
        ctx = myGameArea.context;
        ctx.drawImage(this.image, 32, 0, 32, 32, this.x, this.y, 32, 32);
    }
    
    this.appraisal = function(value, key) {
        var appr = 0.0;
        switch (key){
            case "hunger":
                appr = 1.0- Math.pow((value-100.0)/100.0, 2);
                appr *= worldState["hungerAmp"];
                break;
            case "money":
                appr = value;
                appr *= worldState["moneyAmp"];
                break;
        }
        return appr;
    }
    
    this.desire = function(value, key) {
        var appr = 0.0;
        switch (key){
            case "hunger":
                //appr = -Math.pow((x-50)/50),3) * 0.5 + 0.5;
                //appr *= worldState["hungerAmp"];
                
                break;
            case "money":
                appr = 40*worldState["moneyAmp"];
                break;
        }
        return appr;
    }
    
    this.getEffect = function(currentState, changes) {
        var effect = 0.0;
        for (var key in changes) {
            
            if (currentState[key]){
                var newState = currentState[key] + changes[key];
                effect += this.appraisal(newState, key) - this.appraisal(currentState[key], key);
            }
        }
        return effect;
    }
    
    this.getRetroEffect = function(currentState, changes) {
        var effect = 0.0;
        for (var key in changes) {
            
            if (currentState[key]){
                var priorState = currentState[key] - changes[key];
                effect += this.appraisal(currentState[key], key) - this.appraisal(priorState, key);
            }
        }
        return effect;
    }
    
    this.makeForwardPlan = function(currentState, actionList, attention = this.attention){
        var actionPlan = {effect: null, actions: new Array() };
        
        for ( var currAction in actionList){
            if ( this.meetsReqs(currentState, actionList[currAction])) {
                var comparedEffect = this.getEffect(currentState, actionList[currAction].changes );
                if (attention > 1) {
                    
                    var comparedPlan = this.makeForwardPlan(this.applyChanges(currentState,actionList[currAction].changes), actionList, attention - 1);
                    
                    if ( actionPlan["effect"] == null ) {
                        actionPlan = comparedPlan;
                        actionPlan["actions"].push(actionList[currAction]);
                        actionPlan["effect"] += comparedEffect;
                        
                    } else if ( actionPlan["effect"] < (comparedPlan["effect"] + comparedEffect) ) {
                        actionPlan = comparedPlan;
                        actionPlan["actions"].push(actionList[currAction]);
                        actionPlan["effect"] += comparedEffect;
                        
                    }
                } else {
                    if (actionPlan["effect"] == null) {
                        //console.log("no effect exists, adding: " +actionList[currAction].name);
                        actionPlan["effect"] = comparedEffect;
                        actionPlan["actions"].push(actionList[currAction]);
                        
                    } else if ( actionPlan["effect"] < comparedEffect ) {
                        actionPlan["effect"] = comparedEffect;
                        actionPlan["actions"].pop();
                        actionPlan["actions"].push(actionList[currAction]);
                        
                    }
                    
                }
            }
        }
        return actionPlan;
    }
    
    this.makeReversePlan = function(currentState, actionList, attention = this.attention){
        var actionPlan = {effect: null, actions: new Array() };
        
        for ( var currAction in actionList){
            if ( this.meetsReqs(currentState, actionList[currAction])) {
                var comparedEffect = this.getEffect(currentState, actionList[currAction].changes );
                if (attention > 1) {
                    
                    var comparedPlan = this.makePlan(this.applyChanges(currentState,actionList[currAction].changes), actionList, attention - 1);
                    
                    if ( actionPlan["effect"] == null ) {
                        actionPlan = comparedPlan;
                        actionPlan["actions"].push(actionList[currAction]);
                        actionPlan["effect"] += comparedEffect;
                        
                    } else if ( actionPlan["effect"] < (comparedPlan["effect"] + comparedEffect) ) {
                        actionPlan = comparedPlan;
                        actionPlan["actions"].push(actionList[currAction]);
                        actionPlan["effect"] += comparedEffect;
                        
                    }
                } else {
                    if (actionPlan["effect"] == null) {
                        //console.log("no effect exists, adding: " +actionList[currAction].name);
                        actionPlan["effect"] = comparedEffect;
                        actionPlan["actions"].push(actionList[currAction]);
                        
                    } else if ( actionPlan["effect"] < comparedEffect ) {
                        actionPlan["effect"] = comparedEffect;
                        actionPlan["actions"].pop();
                        actionPlan["actions"].push(actionList[currAction]);
                        
                    }
                    
                }
            }
        }
        return actionPlan;
    }
    
    this.meetsReqs = function(currentState, currentAction){
        var result = true;
        for ( var req in currentAction.requirements){
            
            
            if ( currentState[req] == undefined || (currentState[req] < currentAction.requirements[req]) ) {
                result = false;
            }
        }
        return result;
    }
    
    this.applyChanges = function(currentState, changes){
        var resultState = [];
        for (var key in currentState) {
            resultState[key] = currentState[key];
        }
        for (var key in changes) {
            if ( resultState[key] == undefined ){
                resultState[key] = 0.0;
            }
            resultState[key] += changes[key];
        }
        return resultState;
    }
}

function updateGameArea() {
    myGameArea.clear();
    myGamePiece.update();
    for ( var val of doodads){
        val.update();
    }
}

