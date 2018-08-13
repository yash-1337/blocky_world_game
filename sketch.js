let blocky;
let blockyInitialPos;

let endPortal;

let unit = 65;
let speed = 0.5;

let cols;
let rows;

let borderRadius = 0;

let level1 = [
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', 'B', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', 'S', 'P', 'P', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', 'P', 'P', ' ', ' ', 'P', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', 'S', ' ', ' ', ' ', ' ', 'S', ' ', 'E'],
	['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P']
];

let level2 = [
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', 'B', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', 'S', ' ', ' ', ' ', ' ', ' ', ' ', 'S', 'S', ' ', ' ', 'S', 'E'],
	['P', 'P', 'P', ' ', ' ', 'P', ' ', ' ', 'P', 'P', ' ', 'P', 'P', 'P']
];

let level3 = [
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'E'],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'P'],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', 'B', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'S', 'S', 'S', ' ', ' ', 'T', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', 'P', ' ', ' ', ' ', ' ', 'P', 'P', 'P', 'P', 'P', 'P', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', 'P', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	[' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
	['P', 'P', ' ', ' ', ' ', ' ', ' ', ' ', 'P', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']


]

let levels = [level1, level2, level3];

let currentLevel = 1;
let currLevelLayout = levels[currentLevel - 1];

let XtranslatePoint = unit * 4;
let XtranslateAmt = 0;

let YTOPtranslatePoint = unit * 2;
let YBOTTOMtranslatePoint = unit * 8;
let YtranslateAmt = 0;

let platforms;
let spikes;
let trampolines;

let scenes = ['menu', 'instructions', 'game', 'win', 'over'];
let state = 'menu';

let backgroundBlocky;

let playButton;
let instructButton;
let backButton;
let playAgainButton;

function setup() {
	createCanvas(800, 800);

	cols = width / unit;
	rows = height / unit;

	resetLayout();

	playButton = new Button(200, height / 2, 400, 100, 5, 'Play', color(70, 50, 120), color(100, 80, 150), color(255), () => state = 'game');
	instructButton = new Button(200, height * 2 / 3, 400, 100, 5, 'Instructions', color(70, 50, 120), color(100, 80, 150), color(255), () => state = 'instructions');
	backButton = new Button(275, height * 5 / 6, 250, 75, 5, 'Go Back', color(70, 50, 120), color(100, 80, 150), color(255), () => state = 'menu');
	playAgainButton = new Button(200, height * 2 / 3, 400, 100, 5, 'Play Again', color(70, 50, 120), color(100, 80, 150), color(255), () => {
		state = 'game';
		currentLevel = 1;
		currLevelLayout = levels[currentLevel - 1];
		blocky.health = 100;
		blocky.lives = 3;
		resetLayout();
	});
	backgroundBlocky = new BackgroundBlocky();
}

function draw() {

	switch (state) {
		case 'menu':
			showMenu();
			break;

		case 'instructions':
			showInstructions();
			break;

		case 'game':
			runGame();
			break;

		case 'win':
			showWinMenu();
			break;

		case 'over':
			showGameOverMenu();
			break;
	}


}

function resetLayout() {

	platforms = [];
	spikes = [];
	trampolines = [];

	for (let i = 0; i < currLevelLayout.length; i++) {
		for (let j = 0; j < currLevelLayout[i].length; j++) {
			let currBlock = currLevelLayout[i][j];
			if (currBlock === 'B') {
				blockyInitialPos = [j * unit, i * unit];
				if (blocky) {
					let prevHealth = blocky.health;
					let numLives = blocky.lives;
					console.log(numLives);
					blocky = new Blocky(j * unit, i * unit, prevHealth, numLives);
				} else {
					blocky = new Blocky(j * unit, i * unit);
				}

			} else if (currBlock === 'P') {
				platforms.push(new Platform(j * unit, i * unit));
			} else if (currBlock === 'S') {
				spikes.push(new Spikes(j * unit, i * unit));
			} else if (currBlock === 'E') {
				endPortal = new EndPortal(j * unit, i * unit);
			} else if (currBlock === 'T') {
				trampolines.push(new Trampoline(j * unit, i * unit));
			}
		}
	}
}

function runGame() {
	textAlign(LEFT);

	background(150, 200, 255);

	let XmaxTranslateAmt = (currLevelLayout[currLevelLayout.length - 1].length - cols) * unit;
	XtranslateAmt = constrain(XtranslatePoint - blocky.pos.x, -XmaxTranslateAmt, 0);

	if (blocky.pos.y <= YTOPtranslatePoint) {
		YtranslateAmt = YTOPtranslatePoint - blocky.pos.y;
	} else if (blocky.pos.y >= YBOTTOMtranslatePoint) {
		YtranslateAmt = constrain(YBOTTOMtranslatePoint - blocky.pos.y, YBOTTOMtranslatePoint - (currLevelLayout.length - 1) * unit, 0);
	} else {
		YtranslateAmt = 0;
	}

	translate(XtranslateAmt, YtranslateAmt);

	endPortal.render();

	for (let platform of platforms) {
		platform.render();
	}

	for (let spike of spikes) {
		spike.render();
	}

	for (let trampoline of trampolines) {
		trampoline.render();
	}

	blocky.update();
	blocky.render();
}

function showMenu() {
	background(150, 200, 255);

	textAlign(CENTER, CENTER);
	textSize(96);


	fill(255, 150);
	stroke(200, 150);
	text('Blocky World', width / 2 - 10, height / 4 + 10);
	fill(255, 200);
	stroke(200, 200);
	text('Blocky World', width / 2 - 5, height / 4 + 5);
	fill(255);
	stroke(200);
	text('Blocky World', width / 2, height / 4);

	playButton.update();
	playButton.render();

	instructButton.update();
	instructButton.render();

	backgroundBlocky.update();
	backgroundBlocky.render();
}

function showInstructions() {
	background(150, 200, 255);

	textAlign(CENTER, CENTER);
	textSize(96);


	fill(255, 150);
	strokeWeight(1);
	stroke(200, 150);
	text('Instructions', width / 2 - 10, height / 4 + 10);
	fill(255, 200);
	stroke(200, 200);
	text('Instructions', width / 2 - 5, height / 4 + 5);
	fill(255);
	stroke(200);
	text('Instructions', width / 2, height / 4);

	textSize(30);
	stroke(150);
	strokeWeight(3);
	text("Use the arrow keys to move Blocky. Try to get to the Portal.\nDon't step on the spikes. The pink trampoline makes you \njump higher.", width / 2, height * 2 / 3 - 100);

	backButton.update();
	backButton.render();
}

function showWinMenu() {
	background(150, 200, 255);

	textAlign(CENTER, CENTER);
	textSize(96);


	fill(255, 150);
	strokeWeight(1);
	stroke(200, 150);
	text('You Win!', width / 2 - 10, height / 4 + 10);
	fill(255, 200);
	stroke(200, 200);
	text('You Win!', width / 2 - 5, height / 4 + 5);
	fill(255);
	stroke(200);
	text('You Win!', width / 2, height / 4);

	textSize(30);
	stroke(150);
	strokeWeight(3);
	text(`Great Job! You won with ${blocky.lives} lives left!`, width / 2, height * 2 / 3 - 100);

	playAgainButton.update();
	playAgainButton.render();

	backgroundBlocky.update();
	backgroundBlocky.render();
}

function showGameOverMenu() {
	background(25);

	textAlign(CENTER, CENTER);
	textSize(96);


	fill(255, 150);
	strokeWeight(1);
	stroke(200, 150);
	text('Game Over', width / 2 - 10, height / 4 + 10);
	fill(255, 200);
	stroke(200, 200);
	text('Game Over', width / 2 - 5, height / 4 + 5);
	fill(255);
	stroke(200);
	text('Game Over', width / 2, height / 4);

	textSize(30);
	stroke(150);
	strokeWeight(3);
	text(`Uh oh! you lost! want to play again?`, width / 2, height * 2 / 3 - 100);

	playAgainButton.update();
	playAgainButton.render();
}