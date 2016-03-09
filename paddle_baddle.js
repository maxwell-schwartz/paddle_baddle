var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d"); 

var mode = 1;
var loser_l = 30;

var wall_w = 14;
var paddle_w = 74;
var en_size = 30;

var right_press = false;
var left_press = false;

var p1_power_up1 = 0;
var p1_power_up2 = 0;
var p1_power_up3 = 0;
var p2_power_up1 = 0;
var p2_power_up2 = 0;
var p2_power_up3 = 0;

var p1_pu1_on = false;
var p1_pu2_on = false;
var p1_pu3_on = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) {
    // right arrow
    if (e.keyCode == 39) {
        right_press = true;
        p1_paddle.r = true;
    }
    // left arrow
    else if (e.keyCode == 37) {
        left_press = true;
        p1_paddle.l = true;
    }
    else if (e.keyCode == 32) {
        if (mode == 1) {
            mode = 2;
        }
        else if (mode == 3) {
            p1_power_up1 = 0;
            p1_power_up2 = 0;
            p1_power_up3 = 0;
            p2_power_up1 = 0;
            p2_power_up2 = 0;
            p2_power_up3 = 0;
            p1_pu1_on = false;
            p1_pu2_on = false;
            p1_pu3_on = false;
            p1_paddle.x = (p1_paddle.l_bound+p1_paddle.r_bound)/2;
            p2_paddle.x = (p2_paddle.l_bound+p2_paddle.r_bound)/2;
            for (var x=0; x<p1_enemies.length; x++) {
                p1_enemies[x].freeze_counter = 0;
                p1_enemies[x].speed_counter = 0;
                p1_enemies[x].reset();
            }
            for (var y=0; y<p1_enemies.length; y++) {
                p2_enemies[y].freeze_counter = 0;
                p2_enemies[y].speed_counter = 0;
                p2_enemies[y].reset();
            }
            p1_ball.lives = 5;
            p2_ball.lives = 5;
            p1_ball.reset();
            p2_ball.reset();
            mode = 2;
        }
    }
}
function keyUpHandler(e) {
    // right arrow
    if(e.keyCode == 39) {
        right_press = false;
        p1_paddle.r = false;
    }
    // left arrow
    else if(e.keyCode == 37) {
        left_press = false;
        p1_paddle.l = false;
    }
    // 1 key
    else if(e.keyCode == 49) {
        if (p1_power_up1 > 0) {
            p1_pu1_on = true;
        }
    }
    // 2 key
    else if(e.keyCode == 50) {
        if (p1_power_up2 > 0) {
            p1_pu2_on = true;
        }
    }
    // 3 key
    else if(e.keyCode == 51) {
        if (p1_power_up3 > 0) {
            p1_pu3_on = true;
        }
    }
}

function Ball (lb, rb, p) {
	this.l_bound = lb;
	this.r_bound = rb;
	this.p = p;
    this.lives = 5;
	this.x = (this.l_bound+this.r_bound)/2;
	this.y = canvas.height/2;
	this.x_change = 0;
	this.y_change = 4;
	this.radius = 10;
    this.boost_counter = 0;
	this.reset = function() {
		this.x = this.p.x+paddle_w/2;
		this.y = canvas.height/2;
		this.x_change = 0;
		this.y_change = 4;
        this.boost_counter = 0;
	}
	this.move = function() {
		// wall collision
		if (this.x-this.radius <= this.l_bound) {
            if (this.x_change == 0) {
                this.x_change = 2;
            } else {
                this.x_change = Math.abs(this.x_change);
            }
    	}
        if (this.x+this.radius >= this.r_bound) {
            if (this.x_change == 0) {
                this.x_change = -2;
            } else {
                this.x_change = -(Math.abs(this.x_change));
            }
        }
        // ceiling collision
    	if (this.y-this.radius <= 0) {
    		this.y_change = Math.abs(this.y_change);
    	}
    	if (this.y+this.radius >= this.p.y) {
            // paddle collision
            if (this.x+this.radius > this.p.x && this.x-this.radius < this.p.x+this.p.w) {
                this.y_change = -(Math.abs(this.y_change));
                // paddle movement affects ball
                if (this.p.r == true) {
                    if (this.x_change >= 2 && this.x_change < 5) {
                        this.x_change += 1;
                    } else if (this.x_change < 2) {
                        this.x_change = 2;
                    }
                } else if (this.p.l == true) {
                    if (this.x_change <= -2 && this.x_change > -5) {
                        this.x_change -= 1;
                    } else if (this.x_change > -2) {
                        this.x_change = -2;
                    }
                }
            }
            // floor 
            else if (this.y+this.radius > canvas.height) {
                this.reset();
                if (this.lives > 0) {
                    this.lives -= 1;
                }
            }
        }
		this.x += this.x_change;
		this.y += this.y_change;
	};
	this.draw = function() {
		this.move();
		ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "#0096DD";
        ctx.fill();
        ctx.closePath();
        if (this.boost_counter > 0) {
            this.radius = 40;
            this.boost_counter -= 1;
        } else {
            this.radius = 10;
        }
        if (this.lives < 1) {
            loser_l = this.l_bound;
            mode = 3;
        }
	};
}

function Paddle (lb, rb) {
	this.l_bound = lb;
	this.r_bound = rb;
	this.w = paddle_w;
	this.h = 10;
	this.x = (this.l_bound+this.r_bound)/2;
	this.y = canvas.height-10;
	this.r = false;
	this.l = false;
	this.draw = function() {
		ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
	};
}

function Enemy (lb, rb, ball) {
    this.l_bound = lb;
    this.r_bound = rb-en_size;
    this.b = ball;
    this.x = Math.floor(Math.random() * (this.r_bound-this.l_bound)) + this.l_bound;
    this.y = Math.floor(Math.random() * -canvas.height/2);
    this.y_change = .2;
    this.freeze_counter = 0;
    this.speed_counter = 0;
    this.state = Math.floor(Math.random() * 20) + 1;
    this.reset = function() {
        this.x = Math.floor(Math.random() * (this.r_bound-this.l_bound)) + this.l_bound;
        this.y = Math.floor(Math.random() * canvas.height/2 * (-1));
        this.state = Math.floor(Math.random() * 20) + 1;
    };
    this.move = function() {
        if (this.y > canvas.height) {
            if (this.b.lives > 0) {
                this.b.lives -= 1;
            }
            this.reset();
        } else {
            this.y += this.y_change;
        }
    };
    this.powerUp = function() {
        if (this.state == 1) {
            if (this.b == p1_ball && p1_power_up1 < 3) {
                p1_power_up1 += 1;
            } else if (this.b == p2_ball && p2_power_up1 < 3) {
                p2_power_up1 += 1;
            }
        } else if (this.state == 2) {
            if (this.b == p1_ball && p1_power_up2 < 3) {
                p1_power_up2 += 1;
            } else if (this.b == p2_ball && p2_power_up2 < 3) {
                p2_power_up2 += 1;
            }
        } else if (this.state == 3) {
            if (this.b == p1_ball && p1_power_up3 < 3) {
                p1_power_up3 += 1;
            } else if (this.b == p2_ball && p2_power_up3 < 3) {
                p2_power_up3 += 1;
            }
        }
    };
    this.colDetect = function() {
        // any collision
        if (Math.abs(this.y+en_size/2-this.b.y) <= en_size/2+this.b.radius && Math.abs(this.x+en_size/2-this.b.x) <= en_size/2+this.b.radius) {
            // right side of ball, left side of block
            if (this.b.x < this.x) {
                // ball should bounce off even if it has no side velocity
                if (this.b.x_change == 0) {
                    this.powerUp();
                    this.reset();
                    this.b.x_change = -2;
                } else {
                    this.powerUp();
                    this.reset();
                    this.b.x_change = -this.b.x_change;
                }
            }
            // left side of ball, right side of block
            else if (this.b.x > this.x+en_size) {
                if (this.b.x_change == 0) {
                    this.powerUp();
                    this.reset();
                    this.b.x_change = 2;
                } else {
                    this.powerUp();
                    this.reset();
                    this.b.x_change = -this.b.x_change;
                }
            }
            // bottom of ball, top of block
            else if (this.b.y < this.y) {
                this.powerUp();
                this.reset();
                this.b.y_change = -this.b.y_change;
            }
            // top of ball, bottom of block
            else if (this.b.y > this.y+en_size) {
                this.powerUp();
                this.reset();
                this.b.y_change = -this.b.y_change;
            }
        }
    };
    this.draw = function() {
        this.colDetect();
        ctx.beginPath();
        ctx.rect(this.x, this.y, en_size, en_size);
        if (this.state > 3) {
            ctx.fillStyle = "green";
        } else {
            ctx.fillStyle = "purple";
        }
        ctx.fill();
        ctx.closePath();
        this.move();
        if (this.freeze_counter > 0) {
            this.y_change = 0;
            this.freeze_counter -= 1;
        }
        else if (this.speed_counter > 0) {
            this.y_change = .4;
            this.speed_counter -= 1;
        } else {
            this.y_change = .2;
        }
    };
}

var p1_paddle = new Paddle(wall_w, canvas.width/2-wall_w/2-paddle_w);
var p2_paddle = new Paddle(canvas.width/2+wall_w/2, canvas.width-paddle_w-wall_w);
var p1_ball = new Ball(wall_w/2, canvas.width/2, p1_paddle);
var p2_ball = new Ball(canvas.width/2, canvas.width-wall_w/2, p2_paddle);
var p1_enemies = [];
var p2_enemies = [];
for (var i=0; i<10; i++) {
    p1_enemies[i] = new Enemy(wall_w, canvas.width/2-wall_w/2, p1_ball);
}
for (var j=0; j<10; j++) {
    p2_enemies[j] = new Enemy(canvas.width/2+wall_w/2, canvas.width-en_size-wall_w, p2_ball);
}

function paddleMove() {
	if (right_press && p1_paddle.x < p1_paddle.r_bound) {
	    p1_paddle.x += 7;
	} else if (left_press && p1_paddle.x > p1_paddle.l_bound) {
        p1_paddle.x -= 7;
    }
    if (p2_paddle.x+paddle_w/2 < p2_ball.x && p2_paddle.x < p2_paddle.r_bound) {
    	p2_paddle.x += 4;
    	p2_paddle.r = true;
    	p2_paddle.l = false;
    } else if (p2_paddle.x+paddle_w/2 > p2_ball.x && p2_paddle.x > p2_paddle.l_bound) {
    	p2_paddle.x -= 4;
    	p2_paddle.r = false;
    	p2_paddle.l = true;
    } else {
    	var side = Math.floor((Math.random() * 2));
    	switch (side) {
    		case 0:
    			p2_paddle.r = true;
    			p2_paddle.l = false;
    			break;
    		case 1:
    			p2_paddle.r = false;
    			p2_paddle.l = true;
    			break;
    	}
    }
}

function powerUpCheck() {
    if (p1_pu1_on) {
        p1_ball.boost_counter = 500;
        p1_power_up1 -= 1;
        p1_pu1_on = false;
    }
    if (p1_pu2_on) {
        for (var i=0; i<p1_enemies.length; i++) {
            p1_enemies[i].freeze_counter = 500;
            p1_enemies[i].speed_counter = 0;
        }
        p1_power_up2 -= 1;
        p1_pu2_on = false;
    }
    if (p1_pu3_on) {
        for (var j=0; j<p1_enemies.length; j++) {
            p2_enemies[j].speed_counter = 500;
            p2_enemies[j].freeze_counter = 0;
        }
        p1_power_up3 -= 1;
        p1_pu3_on = false;
    }
    if (p2_power_up1 > 0) {
        var p2_chance1 = Math.floor(Math.random() * 500) + 1;
        if (p2_chance1 == 1) {
            p2_ball.boost_counter = 500;
            p2_power_up1 -= 1;
        }
    }
    if (p2_power_up2 > 0) {
        var p2_chance2 = Math.floor(Math.random() * 500) + 1;
        if (p2_chance2 == 1) {
            for (var i=0; i<p1_enemies.length; i++) {
                p2_enemies[i].freeze_counter = 500;
                p2_enemies[i].speed_counter = 0;
            }
            p2_power_up2 -= 1;
        }
    }
    if (p2_power_up3 > 0) {
        var p2_chance3 = Math.floor(Math.random() * 500) + 1;
        if (p2_chance3 == 1) {
            for (var j=0; j<p1_enemies.length; j++) {
                p1_enemies[j].speed_counter = 500;
                p1_enemies[j].freeze_counter = 0;
            }
            p2_power_up3 -= 1;
        }
    }
}

function powerUpDisplay() {
    for (var i=8; i<p1_power_up1+8; i++){
        ctx.beginPath();
        ctx.rect(3, wall_w*i, wall_w/2, wall_w/2);
        ctx.fillStyle = "DeepPink";
        ctx.fill();
        ctx.closePath();
    }
    for (var j=14; j<p1_power_up2+14; j++){
        ctx.beginPath();
        ctx.rect(3, wall_w*j, wall_w/2, wall_w/2);
        ctx.fillStyle = "MediumSlateBlue";
        ctx.fill();
        ctx.closePath();
    }
    for (var k=20; k<p1_power_up3+20; k++){
        ctx.beginPath();
        ctx.rect(3, wall_w*k, wall_w/2, wall_w/2);
        ctx.fillStyle = "MediumSpringGreen";
        ctx.fill();
        ctx.closePath();
    }
    for (var x=8; x<p2_power_up1+8; x++){
        ctx.beginPath();
        ctx.rect(canvas.width-3-wall_w/2, wall_w*x, wall_w/2, wall_w/2);
        ctx.fillStyle = "DeepPink";
        ctx.fill();
        ctx.closePath();
    }
    for (var y=14; y<p2_power_up2+14; y++){
        ctx.beginPath();
        ctx.rect(canvas.width-3-wall_w/2, wall_w*y, wall_w/2, wall_w/2);
        ctx.fillStyle = "MediumSlateBlue";
        ctx.fill();
        ctx.closePath();
    }
    for (var z=20; z<p2_power_up3+20; z++){
        ctx.beginPath();
        ctx.rect(canvas.width-3-wall_w/2, wall_w*z, wall_w/2, wall_w/2);
        ctx.fillStyle = "MediumSpringGreen";
        ctx.fill();
        ctx.closePath();
    }
}

function displayLives() {
    ctx.textAlign = "start";
    ctx.font = "bold 20px Verdana";
    ctx.fillStyle = "FireBrick";
    ctx.fillText(p1_ball.lives, p1_ball.l_bound+15, 25);
    ctx.fillText(p2_ball.lives, p2_ball.l_bound+15, 25);
}

function drawWall() {
	ctx.beginPath();
    // left
    ctx.rect(0, 0, wall_w, canvas.height);
    // center
	ctx.rect(canvas.width/2-wall_w/2, 0, wall_w, canvas.height);
    // right
    ctx.rect(canvas.width-wall_w, 0, wall_w, canvas.height);
	ctx.fillStyle = "black";
	ctx.fill();
	ctx.closePath();
}

function startScreen() {
    ctx.textAlign = "end";
    ctx.font = "bold 40px Verdana";
    ctx.fillStyle = "DarkSlateGrey";
    ctx.fillText("Paddle", canvas.width/2-wall_w, canvas.height/5);
    ctx.textAlign = "start";
    ctx.fillText("Baddle", canvas.width/2+wall_w, canvas.height/5);
    ctx.textAlign = "center";
    ctx.font = "bold 30px Verdana";
    ctx.fillStyle = "DarkBlue";
    ctx.fillText("This is your side.", canvas.width/4, canvas.height/3);
    ctx.fillStyle = "DarkRed";
    ctx.fillText("This is the enemy's side.", canvas.width-canvas.width/4, canvas.height/3);
    ctx.font = "20px Verdana";
    ctx.fillStyle = "Indigo";
    ctx.fillText("LEFT and RIGHT control paddle.", canvas.width/4, canvas.height/2);
    ctx.fillText("Don't let the ball drop!", canvas.width/4, canvas.height/2+25);
    ctx.fillText("Don't let the blocks pass!", canvas.width/4, canvas.height/2+50);
    ctx.fillText("Purple blocks give powerups.", canvas.width/4, canvas.height/2+75);
    ctx.fillText("1, 2, and 3 to use powerups.", canvas.width/4, canvas.height/2+100);
    ctx.fillStyle = "Red";
    ctx.font = "bold 30px Verdana";
    ctx.fillText("SPACE to start.", canvas.width/4, canvas.height/2+135);
    ctx.font = "20px Verdana";
    ctx.fillStyle = "DeepPink";
    ctx.fillText("1 = Big Ball.", canvas.width-canvas.width/4, canvas.height/2+25);
    ctx.fillStyle = "MediumSlateBlue";
    ctx.fillText("2 = Freeze Your Blocks.", canvas.width-canvas.width/4, canvas.height/2+50);
    ctx.fillStyle = "MediumSpringGreen";
    ctx.fillText("3 = Faster Enemy Blocks.", canvas.width-canvas.width/4, canvas.height/2+75);
}

function gamePlay() {
    powerUpDisplay();
    powerUpCheck();
    p1_ball.draw();
    p2_ball.draw();
    paddleMove();
    p1_paddle.draw();
    p2_paddle.draw();
    for (var x=0; x<p1_enemies.length; x++) {
        p1_enemies[x].draw();
    }
    for (var y=0; y<p2_enemies.length; y++) {
        p2_enemies[y].draw();
    }
    displayLives();
}

function endScreen() {
    if (loser_l < canvas.width/2) {
        ctx.textAlign = "center";
        ctx.font = "bold 40px Verdana";
        ctx.fillStyle = "DarkRed";
        ctx.fillText("Loser :(", canvas.width/4, canvas.height/3);
        ctx.fillStyle = "DarkBlue";
        ctx.fillText("Winner! ^_^", canvas.width-canvas.width/4, canvas.height/3);
    } else {
        ctx.textAlign = "center";
        ctx.font = "bold 40px Verdana";
        ctx.fillStyle = "DarkRed";
        ctx.fillText("Loser :(", canvas.width-canvas.width/4, canvas.height/3);
        ctx.fillStyle = "DarkBlue";
        ctx.fillText("Winner! ^_^", canvas.width/4, canvas.height/3);
    }
    ctx.fillStyle = "Red";
    ctx.fillText("SPACE to play again.", canvas.width/4, canvas.height/2+135);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWall();
	switch(mode) {
        case 1:
            startScreen();
            break;
        case 2:
            gamePlay();
            break;
        case 3:
            endScreen();
            break;
    }
}

setInterval(draw, 10);