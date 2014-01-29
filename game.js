$(document).ready(function () {
	//Canvas stuff
	var canvas     = $("#canvas")[0];
	var ctx        = canvas.getContext("2d");
	var w          = $("#canvas").width();
	var h          = $("#canvas").height();
	
	//Cell width
	var cw         = 12;
	var w_cw       = Math.round(w/cw,0);
	var h_cw       = Math.round(h/cw,0);
	
	var lengthbar  = 10;
	var long_enemy = 10;
	var ybar       = Math.round(h/cw - 5,0);
	var dball;
	var score;
	var bar_array;
	var ball;
	var d;
	var pushed = false;

	var enemy_array;
	var map = [];

	var background = new Image();
	background.src = "texture.png";

	// Make sure the image is loaded first otherwise nothing will draw.
	background.onload = function(){
		ctx.drawImage(background,0,0);
	}

	function Ex(x, y) {
		if (map[x][y] == 1) return true;
		else return false;
	}

	function create_bar() {
		var length = lengthbar;
		bar_array = [];
		for (var i=length - 1; i>=0; i--) {
			bar_array.push({
				x: Math.round(i+w/2/cw-length/2,0),
				y: ybar
			});
		}
	}

	function create_ball() {
		ball = {
			x: Math.round(Math.random() * (w - cw) / cw,0),
			y: Math.round(Math.random() * (h - 10*cw - cw) / cw,0),
			angle: 45,
			x_rem: 1,
			y_rem: 1
		};
		dball = {
			x: -1,
			y: -1
		};
	}

	function exists_enemy(column, line) {
		var exist = false;
		for (var i=0; i<enemy_array.length; i++) {
			for (var j=0; j<enemy_array[i].length; j++) {
				var e = enemy_array[i][j];
				if (e.x == column && e.y == line) {
					enemy_array[i][j].life++;
					exist = true;
				}
			}
		}
		return exist;
	}

	function create_enemy() {
		enemy = [];
		var random = Math.random() * 1000;
		var line = Math.round(random % 5, 0);
		var column = Math.round(random % (h/cw-long_enemy), 0);

		for (var i=0; i<long_enemy; i++) {
			if (exists_enemy(column+i, line+5) === false) {
				enemy.push({
					x: column + i,
					y: line + 5,
					life: 1
				});
				map[column+i][line+5] = 1;
			}
		}
		return enemy;
	}

	function create_enemies(number_enemies) {
		enemy_array = [];
		for (var i=0; i < number_enemies; i++) {
			enemy_array.push(create_enemy());
		}
	}

	function create_map() {
		for (var i=0; i< w_cw; i++) {
			map[i] = [];
		}

		for (i=0; i < w_cw; i++) {
			for (var j=0; j < h_cw; j++) {
				map[i].push(0);
			}
		}
	}

	function move_ball() {
		if (ball.x <= 0) dball.x = 1;
		if (ball.y <= 0) dball.y = 1;
		if (ball.x*cw >= w) dball.x = -1;
		if (ball.y*cw >= h) dball.y = -1;

		//Movement code for the ball
		ball.x_rem--;
		ball.y_rem--;
		if (dball.x > 0) {
			if (ball.x_rem === 0) {
				ball.x++;
				if (ball.angle == 30) ball.x_rem = 2;
				else ball.x_rem = 1;
			}
		}
		else {
			if (ball.x_rem === 0) {
				ball.x--;
				if (ball.angle == 30) ball.x_rem = 2;
				else ball.x_rem = 1;
			}
		}

		if (dball.y > 0) {
			if (ball.y_rem === 0) {
				ball.y++;
				if (ball.angle == 60) ball.y_rem = 2;
				else ball.y_rem = 1;
			}
		}
		else {
			if (ball.y_rem === 0) {
				ball.y--;
				if (ball.angle == 60) ball.y_rem = 2;
				else ball.y_rem = 1;
			}
		}
	}

	function move_bar(calc) {
		for (var i=0; i<lengthbar; i++) {
			bar_array[i].x = bar_array[i].x + calc;
		}
	}

	function hit(element, i, j) {
		score = score + 10;

		if (element.life > 1) element.life--;
		else {
			enemy_array[i].splice(j, 1);
			map[element.x][element.y] = 0;
		}

		if (enemy_array[i].length === 0) {
			enemy_array.splice(i, 1);
			score = score + 100;
		}

		ball.x_rem = 1;
		ball.y_rem = 1;
	}

	function bar_collision() {
		if (ball.y == ybar && dball.y == 1) {
			for (i=0; i<lengthbar; i++) {
				if (ball.x == bar_array[i].x) dball.y = -1;
			}
			if (ball.x == (bar_array[lengthbar-1].x + 1)) dball.y = -1;
		}
	}

	function check_collision() {
		for (var i=0; i<enemy_array.length; i++) {
			var array_length = enemy_array[i].length;
			for (var j=0; j<array_length; j++) {
				
				var e = enemy_array[i][j];
				if (e === undefined) break;
				
				if (dball.x == -1 && dball.y == 1 && e.x == ball.x && e.y == ball.y) {
					if (Ex(ball.x-1, ball.y-1) === true) dball.x = dball.x * -1;
					dball.y = dball.y * -1;
					hit(e, i, j);
					console.log("case 1");
				}
				else if (dball.x == -1 && dball.y == 1 && e.x == (ball.x - 1) && e.y == ball.y) {
					if (Ex(ball.x - 1, ball.y - 1) === false) {
						dball.y = dball.y * (-1);
					}
					else {
						dball.x = dball.x * (-1);
						dball.y = dball.y * (-1);
					}
					hit(e, i, j);
					console.log("case 2");
				}
				else if (dball.x == -1 && dball.y == 1 && e.x == (ball.x - 1) && e.y == (ball.y - 1)) {
					if (Ex(ball.x, ball.y) === true) dball.y = dball.y * (-1);
					dball.x = dball.x * (-1);
					hit(e, i, j);
					console.log("case 4");
				}
				else if (dball.x == 1 && dball.y == -1 && e.x == (ball.x - 1) && e.y == (ball.y - 1)) {
					if (Ex(ball.x, ball.y) === true) dball.x = dball.x * (-1);
					dball.y = dball.y * (-1);
					hit(e, i, j);
					console.log("case 5");
				}
				else if (dball.x == 1 && dball.y == -1 && e.x == ball.x && e.y == ball.y) {
					if (Ex(ball.x - 1, ball.y - 1) === true) dball.y = dball.y * (-1);
					dball.x = dball.x * (-1);
					hit(e, i, j);
					console.log("case 7");
				}
				else if (dball.x == 1 && dball.y == -1 && e.x == ball.x && e.y == (ball.y - 1)) {
					dball.y = dball.y * (-1);
					hit(e, i, j);
					console.log("case 8");
				}
				else if (dball.x == -1 && dball.y == -1 && e.x == (ball.x - 1) && e.y == (ball.y - 1)) {
					if (Ex(ball.x - 1, ball.y) === false) {
						dball.y = dball.y * (-1);
					} else if (Ex(ball.x, ball.y-1) === true) {
						dball.x = dball.x * (-1);
						dball.y = dball.y * (-1);
					} else {dball.x = dball.x * (-1);}
					hit(e, i, j);
					console.log("case 9");
				}
				else if (dball.x == -1 && dball.y == -1 && e.x == (ball.x - 1) && e.y == ball.y) {
					if (Ex(ball.x, ball.y + 1) === true) dball.y = dball.y * (-1);
					dball.x = dball.x * (-1);
					hit(e, i, j);
					console.log("case 10");
				}
				else if (dball.x == 1 && dball.y == 1 && e.x == ball.x && e.y == ball.y) {
					if (Ex(ball.x, ball.y - 1) === false) {
						dball.y = dball.y * (-1);
					}
					else if (Ex(ball.x-1, ball.y) === false) {
						dball.x = dball.x * (-1);
					}
					else {
						dball.x = dball.x * (-1);
						dball.y = dball.y * (-1);
					}
					hit(e, i, j);
					console.log("case 11");
				}
				else if (dball.x == 1 && dball.y == 1 && e.x == ball.x && e.y == (ball.y - 1)) {
					if (Ex(ball.x - 1, ball.y) === true) dball.y = dball.y * (-1);
					dball.x = dball.x * (-1);
					hit(e, i, j);
					console.log("case 12");
				}

				//if (enemy_array[i] !== undefined) break;
			}
		}
	}

	function paint() {
		var i=0;

		//To avoid the bar trail we need to paint the BG on every frame
		//Lets paint the canvas now
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);

		//Movement for the ball
		move_ball();

		//Movement code for the bar
		var nx = bar_array[0].x;

		if (nx>=lengthbar && d=="left") move_bar(-1);
		if (nx < w/cw && d=="right") move_bar(1);

		//Collision with the bar
		bar_collision();

		//Collision with the enemies
		check_collision();

		//Paint the ball
		var b = ball;
		ctx.beginPath();
		ctx.arc(b.x*cw, b.y*cw, cw/3, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'red';
		ctx.fill();

		//Paint the enemies
		for (i=0; i < enemy_array.length; i++) {
			for (var j=0; j < enemy_array[i].length; j++) {
				var e = enemy_array[i][j];
				//Lets paint 10px wide cells
				if (e.life > 2) ctx.fillStyle="green";
				else if (e.life == 1) ctx.fillStyle="pink";
				else ctx.fillStyle="grey";
				ctx.fillRect(e.x*cw, e.y*cw, cw, cw);
				ctx.strokeStyle="white";
				ctx.strokeRect(e.x*cw, e.y*cw, cw, cw);
			}
		}

		//Paint the bar
		for (i=0; i < bar_array.length; i++) {
			var c = bar_array[i];
			//Lets paint 10px wide cells
			ctx.fillStyle="blue";
			ctx.fillRect(c.x*cw, c.y*cw, cw, cw);
			ctx.strokeStyle="white";
			ctx.strokeRect(c.x*cw, c.y*cw, cw, cw);
		}

		//Paint the score
		var score_text = "Score: " + score;
		ctx.fillText(score_text, 5, h-5);

	}

	function descend() {
		var i, j;

		for (i=0; i<enemy_array.length; i++) {
			for (j=0; j<enemy_array[i].length; j++) {
				enemy_array[i][j].y++;
			}
		}
		
		for (i=w_cw-1; i>0; i--) {
			for (j=0; j<h_cw; j++) {
				map[i][j] = map[i-1][j];
			}
		}
	}

	function init() {
		create_bar();
		create_ball();
		create_map();
		create_enemies(6);

		score = 0;

		paint();
		game_loop = setInterval(paint, 30);
		game_descend = setInterval(descend, 50000);
	}

	init();

	$(document).keydown(function (e) {
		pushed = true;
		var key = e.which;
		//We will add another clause to prevent reverse gear
		if (key == "37") d = "left";
		else if (key == "39") d = "right";
    });

    $(document).keyup(function (e) {
		d = "";
		pushed = false;
    });

});