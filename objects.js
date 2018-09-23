class Blocky {
	constructor(x, y, prevHealth, numLives) {
		/* global unit */
		this.w = unit;
		this.pos = createVector(x, y);
		this.vel = createVector();
		this.acc = createVector();

		/* global speed */
		this.speed = speed;
		this.rightforce = createVector(this.speed, 0);
		this.leftforce = createVector(-this.speed, 0);
		this.gravity = createVector(0, speed * 1.25);
		this.lift = createVector(0, -25);
		this.jumping = false;

		this.bottomLimit = height - unit;
		this.topLimit;

		this.onTop;

		this.dying = false;
		this.falling = false;

		if (prevHealth) {
			this.health = prevHealth;
		} else {
			this.health = 100;
		}
		if (numLives) {
			this.lives = numLives;
		} else {
			this.lives = 3;
		}

		this.regColor = color(100, 125, 250);
		this.dyingColor = color(255, 0, 50);
		this.currColor = this.regColor;
		this.winColor = color(100, 150, 250, this.opacity);
		this.opacity = 255;

		this.hasWon = false;
		this.TimeoutFinished = false;

		this.eyeXOff = 0;
		this.eyeYOff = 0;
	}

	applyForce(force) {
		this.acc.add(force);
	}

	jump() {
		this.applyForce(this.lift);
	}

	superJump() {
		this.applyForce(this.lift.copy().mult(2));
	}

	tinyJump() {
		this.applyForce(this.lift.copy().mult(0.5));
	}

	death() {
		this.lives--;

		if (this.lives <= 0) {
			/* global state */
			state = 'over';
		} else {
			/* global blockyInitialPos */
			this.pos = createVector(blockyInitialPos[0], blockyInitialPos[1]);

			this.vel.set(0, 0);
			this.acc.set(0, 0);
			this.jumping = false;
			this.bottomLimit = height - unit;
			this.topLimit = undefined;
			this.onTop = undefined;

			this.dying = false;
			this.falling = false;
			this.health = 100;

			this.opacity = 255;
		}
	}

	win() {
		this.hasWon = true;

		/* global endPortal */
		this.pos.x = lerp(this.pos.x, endPortal.x, 0.2);
		this.pos.y = lerp(this.pos.y, endPortal.y, 0.2);
		if (!this.TimeoutFinished) {
			setTimeout(() => {
				this.opacity -= 10;
				this.TimeoutFinished = true;
			}, 750);
		} else {
			this.opacity -= 20;
		}

		if (this.opacity <= 0) {
			this.opacity = 0;
		}

		this.winColor = color(100, 150, 250, this.opacity);

		if (endPortal.opacity <= 0) {
			/* global currentLevel */
			currentLevel++;

			/* global levels */
			if (currentLevel > levels.length) {
				state = 'win';
			} else {
				/* global currLevelLayout */
				currLevelLayout = levels[currentLevel - 1];

				/* global resetLayout */
				resetLayout();
			}
		}
	}

	update() {
		this.rightforce = createVector(this.speed, 0);
		this.leftforce = createVector(-this.speed, 0);

		this.vel.add(this.acc);
		this.acc.set(0, 0);
		this.vel.mult(0.95);
		this.vel.add(this.gravity);
		this.pos.add(this.vel);

		if (this.pos.y + this.w > this.bottomLimit) {
			this.pos.y = this.bottomLimit - this.w;
			this.vel.y *= 0;
		}

		if (this.vel.y != 0) {
			this.jumping = true;
		} else {
			this.jumping = false;
		}

		if (this.topLimit && this.pos.y <= this.topLimit) {
			this.pos.y = this.topLimit;
			this.vel.y *= -0.5;
		}
		if (!this.hasWon) {
			if (keyIsDown(LEFT_ARROW)) {
				this.applyForce(this.leftforce);
			}

			if (keyIsDown(RIGHT_ARROW)) {
				this.applyForce(this.rightforce);
			}

			if (keyIsDown(UP_ARROW)) {
				if (!this.jumping) {
					this.jump();
				}
			}
		}

		this.topLimit = undefined;
		this.onTop = [];

		/* global platforms */
		for (const platform of platforms) {
			if (this.pos.x + this.w > platform.x && this.pos.x < platform.x + platform.w) {
				if (this.pos.y + this.w <= platform.y) {
					this.onTop.push(platform);
				} else if (this.pos.y >= platform.y + platform.h) {
					this.topLimit = platform.y + platform.h;
				} else {
					if (this.pos.x < platform.x) {
						this.pos.x = platform.x - this.w;
					} else {
						this.pos.x = platform.x + platform.w;
					}
				}
			}
		}

		this.bottomLimit = (currLevelLayout.length + 8) * unit;

		for (const platform of this.onTop) {
			if (platform.y < this.bottomLimit) {
				this.bottomLimit = platform.y;
			}
		}
		this.dying = false;

		/* global spikes */
		for (const spike of spikes) {
			if (this.pos.x + this.w > spike.x && this.pos.x < spike.x + spike.w) {
				if (
					this.pos.y + this.w >= spike.y + (spike.w * 2) / 3 &&
					this.pos.y <= spike.y + spike.w
				) {
					this.dying = true;
				}
			}
		}

		/* global trampolines */
		for (const trampoline of trampolines) {
			if (this.pos.x + this.w > trampoline.x && this.pos.x < trampoline.x + trampoline.w) {
				if (
					this.pos.y + this.w > trampoline.y + (trampoline.w * 2) / 3 &&
					this.pos.y < trampoline.y + trampoline.w
				) {
					this.superJump();
				}
			}
		}

		if (this.pos.x + this.w > endPortal.x && this.pos.x < endPortal.x + endPortal.w) {
			if (this.pos.y + this.w > endPortal.y && this.pos.y < endPortal.y + endPortal.w) {
				this.win();
			}
		}

		if (this.dying) {
			this.health -= 1;
		}
		if (this.health <= 0) {
			this.death();
		}

		if (this.pos.y >= (currLevelLayout.length + 7) * unit) {
			this.death();
		}

		if (this.pos.y >= currLevelLayout.length * unit) {
			this.falling = true;
		}

		if (!this.hasWon) {
			this.pos.x = constrain(
				this.pos.x,
				0,
				(currLevelLayout[currLevelLayout.length - 1].length - 1) * unit
			);
		}
	}

	render() {
		if (!this.dying && !this.falling) {
			this.currColor = lerpColor(this.currColor, this.regColor, 0.33);
		} else {
			this.currColor = lerpColor(this.regColor, this.dyingColor, (this.health % 33) / 33);
		}

		if (this.hasWon) {
			this.currColor = this.winColor;
		}

		fill(this.currColor);
		noStroke();

		/* global borderRadius */
		rect(this.pos.x, this.pos.y, this.w, this.w, borderRadius);
		fill(255, this.opacity);
		ellipse(this.pos.x + this.w / 3, this.pos.y + this.w / 3, 12);
		ellipse(this.pos.x + (this.w * 2) / 3, this.pos.y + this.w / 3, 12);

		if (!this.dying && !this.falling) {
			arc(
				this.pos.x + this.w / 2,
				this.pos.y + (this.w * 2) / 3 - 5,
				this.w / 2 + 8,
				this.w / 3 + 5,
				0,
				PI
			);
		} else {
			arc(
				this.pos.x + this.w / 2,
				this.pos.y + (this.w * 2) / 3 + 8,
				this.w / 2 + 8,
				this.w / 3 + 5,
				PI,
				0
			);
		}

		fill(0, this.opacity);
		if (this.vel.x > 0.25) {
			this.eyeXOff = lerp(this.eyeXOff, 2, 0.2);
		} else if (this.vel.x < -0.25) {
			this.eyeXOff = lerp(this.eyeXOff, -2, 0.2);
		} else {
			this.eyeXOff = lerp(this.eyeXOff, 0, 0.2);
		}

		if (this.vel.y < 0) {
			this.eyeYOff = lerp(this.eyeYOff, -1, 0.2);
		} else if (this.vel.y > 0) {
			this.eyeYOff = lerp(this.eyeYOff, 1, 0.2);
		} else {
			this.eyeYOff = lerp(this.eyeYOff, 0, 0.2);
		}

		ellipse(this.pos.x + this.w / 3 + this.eyeXOff, this.pos.y + this.w / 3 + this.eyeYOff, 5);
		ellipse(
			this.pos.x + (this.w * 2) / 3 + this.eyeXOff,
			this.pos.y + this.w / 3 + this.eyeYOff,
			5
		);

		textSize(32);

		if (!this.dying) {
			fill(255);
		} else {
			fill(lerpColor(color(255), this.dyingColor, (this.health % 33) / 33));
		}

		/* global XtranslateAmt */
		/* global YtranslateAmt */
		text(`Health: ${round(this.health)}`, 20 - XtranslateAmt, 45 - YtranslateAmt);

		if (!this.falling) {
			fill(255);
		} else {
			fill(lerpColor(color(255), this.dyingColor, (this.health % 33) / 33));
		}
		text(`Lives: ${round(this.lives)}`, width - 130 - XtranslateAmt, 45 - YtranslateAmt);
	}
}

class Platform {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.w = unit - 0.5;
		this.h = unit;
		this.col = this.y / unit;
		this.row = this.x / unit;
	}

	render() {
		fill(100);
		stroke(110);
		rect(this.x, this.y, this.w + 0.5, this.h, borderRadius);
	}
}

class Spikes {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.w = unit - 0.5;
		this.renderedWidth = this.w + 0.5;
		this.col = this.y / unit;
		this.row = this.x / unit;
	}

	render() {
		fill(250, 25, 50);
		noStroke();
		triangle(
			this.x,
			this.y + this.renderedWidth,
			this.x + this.renderedWidth / 3,
			this.y + this.renderedWidth,
			this.x + this.renderedWidth / 6,
			this.y + (this.renderedWidth * 2) / 3
		);
		triangle(
			this.x + this.renderedWidth / 3,
			this.y + this.renderedWidth,
			this.x + (this.renderedWidth * 2) / 3,
			this.y + this.renderedWidth,
			this.x + this.renderedWidth / 2,
			this.y + (this.renderedWidth * 2) / 3
		);
		triangle(
			this.x + (this.renderedWidth * 2) / 3,
			this.y + this.renderedWidth,
			this.x + this.renderedWidth,
			this.y + this.renderedWidth,
			this.x + (this.renderedWidth * 5) / 6,
			this.y + (this.renderedWidth * 2) / 3
		);
	}
}

class Trampoline {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.w = unit - 0.5;
		this.renderedWidth = this.w + 1;
		this.col = this.y / unit;
		this.row = this.x / unit;
	}

	render() {
		fill(200, 50, 150);
		noStroke();
		rect(this.x, this.y + (this.w * 2) / 3, this.renderedWidth, this.renderedWidth / 3);
	}
}

class EndPortal {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.w = unit;
		this.h = unit;
		this.col = this.y / unit;
		this.row = this.x / unit;
		this.opacityBase = 200;
		this.opacity = this.opacityBase;
		this.color = color(0, 255, 0, this.opacity);
		this.count = 0;
	}

	render() {
		this.count += 0.1;

		/* global blocky */
		if (!blocky.hasWon) {
			this.opacity = this.opacityBase + sin(this.count) * 50;
		} else {
			if (this.opacity >= 20) {
				this.opacity = this.opacityBase + sin(this.count) * 50;
				this.opacityBase -= 0.75;
			} else {
				this.opacity = 0;
			}
		}

		this.color = color(0, 255, 0, this.opacity);

		fill(this.color);
		noStroke();
		rect(this.x, this.y, this.w, this.h, borderRadius);
		fill(
			this.color.levels[0],
			this.color.levels[1] - 75,
			this.color.levels[2],
			this.color.levels[3]
		);
		ellipse(this.x + this.w / 2, this.y + this.w / 2, (this.w * 5) / 6);
		fill(
			this.color.levels[0],
			this.color.levels[1] - 100,
			this.color.levels[2],
			this.color.levels[3]
		);
		ellipse(this.x + this.w / 2, this.y + this.w / 2, (this.w * 2) / 3);
		fill(
			this.color.levels[0],
			this.color.levels[1] - 125,
			this.color.levels[2],
			this.color.levels[3]
		);
		ellipse(this.x + this.w / 2, this.y + this.w / 2, this.w / 2);
		fill(
			this.color.levels[0],
			this.color.levels[1] - 150,
			this.color.levels[2],
			this.color.levels[3]
		);
		ellipse(this.x + this.w / 2, this.y + this.w / 2, this.w / 3);
	}
}

class Button {
	constructor(x, y, width, height, radius, text, color, hoverColor, textColor, clickFunc) {
		this.x = x;
		this.y = y;
		this.w = width;
		this.h = height;
		this.radius = radius;
		this.text = text;
		this.textColor = textColor;
		this.regColor = color;
		this.hoverColor = hoverColor;
		this.currColor = this.regColor;
		this.clickFunc = clickFunc;
	}

	update() {
		if (
			mouseX >= this.x &&
			mouseX <= this.x + this.w &&
			mouseY >= this.y &&
			mouseY <= this.y + this.h
		) {
			this.currColor = lerpColor(this.currColor, this.hoverColor, 0.1);

			if (mouseIsPressed) {
				this.clickFunc();
			}
		} else {
			this.currColor = lerpColor(this.currColor, this.regColor, 0.1);
		}
	}

	render() {
		fill(this.currColor);
		noStroke();
		rect(this.x, this.y, this.w, this.h, this.radius);
		textAlign(CENTER, CENTER);
		fill(this.textColor);
		textSize(48);
		text(this.text, this.x + this.w / 2, this.y + this.h / 2);
	}
}

class BackgroundBlocky {
	constructor() {
		this.w = unit;
		this.pos = createVector(0, height - this.w);
		this.vel = createVector();
		this.acc = createVector();
		this.rightforce = createVector(0.25, 0);

		this.currColor = color(100, 125, 250);
		this.opacity = 255;

		this.gravity = createVector(0, speed * 1.25);
		this.lift = createVector(0, -20);

		this.jumping = false;
	}

	applyForce(force) {
		this.acc.add(force);
	}

	jump() {
		this.applyForce(this.lift);
	}

	update() {
		this.applyForce(this.rightforce);

		this.vel.add(this.acc);
		this.acc.set(0, 0);
		this.vel.mult(0.95);
		this.vel.add(this.gravity);
		this.pos.add(this.vel);

		if (this.pos.x > width) {
			this.pos.x = -this.w;
		}

		if (this.pos.y > height - this.w) {
			this.pos.y = height - this.w;
			this.vel.y *= 0;
		}

		if (this.vel.y != 0) {
			this.jumping = true;
		} else {
			this.jumping = false;
		}

		if (!this.jumping) {
			this.jump();
			this.jumping = true;
		}
	}

	render() {
		fill(this.currColor);
		noStroke();
		rect(this.pos.x, this.pos.y, this.w, this.w, borderRadius);
		fill(255, this.opacity);
		ellipse(this.pos.x + this.w / 3, this.pos.y + this.w / 3, 12);
		ellipse(this.pos.x + (this.w * 2) / 3, this.pos.y + this.w / 3, 12);

		arc(
			this.pos.x + this.w / 2,
			this.pos.y + (this.w * 2) / 3 - 5,
			this.w / 2 + 8,
			this.w / 3 + 5,
			0,
			PI
		);

		fill(0, this.opacity);

		ellipse(this.pos.x + this.w / 3 + 2, this.pos.y + this.w / 3, 5);
		ellipse(this.pos.x + (this.w * 2) / 3 + 2, this.pos.y + this.w / 3, 5);
	}
}
