var myGamePiece;
var doodads = new Array();
var doodadArts = new Array();
var sourceArts = new Array();
var worldState = new Array();
var actions = new Array();
var changesList = new Array();


function gameStart() {

//myGamePiece = new component(30, 30, "red", 10, 120);
    myGamePiece = new character("media/2.png", new frvector([10.0,120.0]), 8, 50.0);
    sourceArts["miscDoodads"] = new sourceArt("media/obj_misk_atlas.png");
    doodadArts["wood"] = new doodadArt("miscDoodads", 1, 12);
    doodadArts["chicken"] = new doodadArt("miscDoodads", 1, 26);
    doodads.push( new doodad(new frvector([20, 50]), "wood") );
    doodads.push( new doodad(new frvector([50, 30]), "wood") );
    doodads.push( new doodad(new frvector([70, 200]), "chicken") );
    worldState["hunger"] = 80.0;
    worldState["hungerAmp"] = 100.0;
    worldState["food"] = 10.0;
    worldState["chicken"] = 0.0;
    worldState["money"] = 20.0;
    worldState["moneyAmp"] = 0.50;
    changesList["hunger"] = 20.0;
    
    //changesList["money"] = -10.0;
    //changesList["test"] = 5.0;
    actions["eatFood"] = new action("eat food",{food:{value:1.0,type:"min"}},{food:{value:-1.0,type:"modify"},hunger:{value:40.0,type:"modify"}});
    actions["cookChicken"] = new action("cook chicken",{chicken:{value:1.0,type:"min"},hunger:{value:1.0,type:"min"}},{chicken:{value:-1.0, type:"modify"},food:{value:4.0, type:"modify"}, hunger:{value:-1.0, type:"modify"}});
    actions["sellFood"] = new action("sell food",{food:{value:1.0,type:"min"}},{food:-1.0,money:10.0});
    actions["buyFood"] = new action("buy food",{money:{value:20.0, type:"min"}},{food:1.0,money:-20.0});
    actions["doWork"] = new action("do work",{hunger:{value:5.0, type:"min"}},{hunger:-5.0,money:20.0});
    actions["buyChicken"] = new action("buy chicken",{money:{value:50.0, type:"min"}},{chicken:1.0,money:-50.0});
    actions["moveTo"] = new action("move");
    
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
        myGamePiece.mover.setTarget(doodads[1].getPos());
        
        this.interval = setInterval(updateGameArea, 17);
        
        //updateGameArea();
    },
    
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function action(name, reqs, chng) {
    this.name = name;
    this.requirements = new requirements(reqs);
    this.changes = new changes(chng);
    
    this.getReq = function(){
        return this.requirements;
    }
    this.getReqList = function(){
        return this.requirements.getList();
    }
    this.getReqValue = function(key){
        return this.requirements.getValue(key);
    }
    
    this.getReqType = function(key){
        return this.changes.getType(key);
    }
    
    this.getChange = function(){
        return this.changes;
    }
    this.getChangeList = function(){
        return this.changes.getList();
    }
    this.getChangeValue = function(key){
        return this.changes.getValue(key);
    }
    
    this.getChangeType = function(key){
        return this.changes.getType(key);
    }
}

function changes(input) {
    this.changes = [];
    for (var key in input) {
        this.changes[key] = {};
        if (typeof input[key] === 'object') {
            this.changes[key].value = input[key].value;
            this.changes[key].type = input[key].type;
        } else {
            this.changes[key].value = input[key];
            this.changes[key].type = "modify";
        }
    }
    
    this.getList = function(){
        return this.changes;
    }
    
    this.getValue = function(key) {
        return this.changes[key].value;
    }
    
    this.getType = function(key) {
        return this.changes[key].type;
    }
}

function character(charImage, pos, attention, speed) {
    this.image = new Image(96, 128);
    this.image.src = charImage;
    this.width = 32;
    this.height = 32;
    //this.x = x;
    //this.y = y;
    //this.pos = pos;
    this.mover = new mover(pos, speed, speed);
    this.attention = attention;
    this.speed = speed;

    
    this.test = function() {
        //console.log
        if ( 15 > this.mover.getPos().subtract(doodads[1].getPos()).mag() ) {
            this.mover.setTarget(doodads[2].getPos());
        } else if ( 15 > this.mover.getPos().subtract(doodads[2].getPos()).mag() ) {
            this.mover.setTarget(doodads[1].getPos());
        }
    }
    
    this.update = function(dt = 17.0){
        this.test();
        this.mover.update(dt);
        var ctx = myGameArea.context;
        ctx.drawImage(this.image, 32, 0, 32, 32, this.mover.x(), this.mover.y(), 32, 32);
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
        for (var key in changes.getList()) {
            var comparison = changes.getValue(key);
            var type = changes.getType(key);
            if (currentState[key]){
                var newState = currentState[key] + comparison;
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
        for ( var req in currentAction.getReqList()){
            var comparison = currentAction.getReqValue(req);
            var type = currentAction.getReqType(req);
            
            if (type = "min") {
                if ( currentState[req] == undefined || (currentState[req] < comparison) ) {
                    result = false;
                }
            }
        }
        return result;
    }
    
    this.applyChanges = function(currentState, changes){
        var resultState = [];
        for (var key in currentState) {
            resultState[key] = currentState[key];
        }
        for (var key in changes.getList()) {
            var comparison = changes.getValue(key);
            var type = changes.getType(key);
            if (type = "modify") {
                if ( resultState[key] == undefined ){
                    resultState[key] = 0.0;
                }
                resultState[key] += comparison;
            }
        }
        return resultState;
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function(){
        var ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
}

function doodad(pos, art) {
    //this.x = x;
    //this.y = y;
    this.pos = pos;
    this.art = art;
    
    this.getImage = function(){
        return doodadArts[this.art].getImage();
    }
    this.update = function(dt = 17.0){
        var ctx = myGameArea.context;
        ctx.drawImage(this.getImage(), doodadArts[this.art].x, doodadArts[this.art].y, 32, 32, this.pos.coords[0], this.pos.coords[1], 32, 32);
    }
    
    this.getPos = function() {
        return this.pos;
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

function frvector(coords) {
    this.coords = coords;
    
    this.x = function(){
        return this.coords[0];
    }
    
    this.y = function(){
        return this.coords[1];
    }
    
    this.z = function(){
        return this.coords[2];
    }
    
    
    
    this.add = function(other) {
        var result = new frvector([]);
        if ( this.coords.length == other.coords.length) {
            for (let i = 0; i < this.coords.length; i++) {
                result.coords[i] = this.coords[i] + other.coords[i];
            }
        }
        
        return result;
    }
    
    this.subtract = function(other) {
        var result = new frvector([]);
        if ( this.coords.length == other.coords.length) {
            for (let i = 0; i < this.coords.length; i++) {
                result.coords[i] = this.coords[i] - other.coords[i];
            }
        }
        
        return result;
    }
    
    this.mult = function(amount){
        var result = new frvector([]);
        for (let i = 0; i < this.coords.length; i++) {
            result.coords[i] = this.coords[i] * amount;
        }
        return result;
    }
    
    this.mag = function() {
        var result = 0.0;
        for (let i = 0; i < this.coords.length; i++) {
            result += this.coords[i]*this.coords[i];
        }
        return Math.sqrt(result);
    }
    
    this.normalize = function() {
        var result = new frvector([]);
        var mag = this.mag();
        
        for (let i = 0; i < this.coords.length; i++) {
            result.coords[i] = this.coords[i]/mag;
        }
        
        return result;
    }
}

function mover(pos, maxSpeed, maxAccel, size = 10.0, adjustTime = 0.1){
    this.pos = pos;
    this.maxSpeed = maxSpeed;
    this.maxAccel = maxAccel;
    this.size = size;
    this.timeToTarget = adjustTime;
    this.velocity = new frvector([0,0]);
    this.acceleration = new frvector([0,0]);
    this.currTarget = this.pos;
    this.currTargetSize = 10.0;
    
    this.arriveWithTarget = function(target, targetSize = this.currTargetSize) {
        // 1
        var vector = target.subtract(this.pos);
        var distance = vector.mag();
        
        // 2
        var targetRadius = this.size + targetSize;
        var slowRadius = targetRadius + 25;
        
        // 3
        if (distance < targetRadius) {
            this.velocity = new frvector([0.0,0.0]);
            this.acceleration = new frvector([0.0,0.0]);
            var result = new frvector([0.0,0.0]);
            return result;
        }
        
        // 4
        var targetSpeed;
        if (distance > slowRadius) {
            targetSpeed = this.maxSpeed;
        } else {
            targetSpeed = this.maxSpeed * distance / slowRadius;
        }
        
        // 5
        var targetVelocity = vector.normalize().mult(targetSpeed);
        
        var acceleration = targetVelocity.subtract(this.velocity).mult(1.0/this.timeToTarget);
        
        // 6
        if (acceleration.mag() > this.maxAcceleration) {
            acceleration = acceleration.normalize().mult(this.maxAcceleration);
        }
        return acceleration;
    }
    
    this.update = function(dt = 17.0){
        this.acceleration = this.arriveWithTarget(this.currTarget);
        this.velocity = this.velocity.add(this.acceleration.mult(dt/1000));
        this.pos = this.pos.add(this.velocity.mult(dt/1000));
    }
    
    this.setTarget = function(target = this.pos, targetSize = 5.0){
        this.currTarget = target;
        this.currTargetSize = targetSize;
    }
    
    this.x = function(){
        return this.pos.x();
    }
    
    this.y = function(){
        return this.pos.y();
    }
    
    this.z = function(){
        return this.pos.z();
    }
    
    this.getPos = function() {
        return this.pos;
    }
}

function requirements(input) {
    this.requirements = [];
    for (var key in input) {
        this.requirements[key] = {};
        if (typeof input[key] === 'object') {
            this.requirements[key].value = input[key].value;
            this.requirements[key].type = input[key].type;
        } else {
            this.requirements[key].value = input[key];
            this.requirements[key].type = "min";
        }
    }
    
    this.getList = function(){
        return this.requirements;
    }
    
    this.getValue = function(key) {
        return this.requirements[key].value;
    }
    
    this.getType = function(key) {
        return this.requirements[key].type;
    }
}

function sourceArt(imageSrc) {
    this.image = new Image(1024, 1024);
    this.image.src = imageSrc;
    
    this.getImage = function(){
        return this.image;
    }
}

function updateGameArea() {
    myGameArea.clear();
    for ( var val of doodads){
        val.update(17.0);
    }
    myGamePiece.update(17.0);
}

