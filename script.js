let canvas;
let ctx;
const canvasSize = 800;
let rafId;
let bulletArray = [];
let bookArray = [];
const imageBigBullet = new Image();
imageBigBullet.src = "resources/image/big_bullet.png"
const imageSmallBullet = new Image();
imageSmallBullet.src = "resources/image/small_bullet.png"
const imageBook = new Image();
imageBook.src = "resources/image/book.png"
const imageBookBackground = new Image();
imageBookBackground.src = "resources/image/book_background.png"

const gameMusic = new Audio("resources/sound/game_music.mp3");
gameMusic.loop = true;
let gameMode = null;
let timeoutArray = [];
//Checkboxes
let checkboxSafespotValue = false;
let checkboxAwfulValue = false;
//FPS Counter
let fpsActivity = [];
//Fps Tamer
let tthen = Date.now();
let targetFps = 60;

//Da Game
initGame();
runGame();

//Anything Else
function initGame() {
    canvas = document.getElementById("game_canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.backgroundColor = "#87441C";
    canvas.addEventListener("click", handleClick);
}

function runGame() {
    rafId = requestAnimationFrame(runGame)
    let tnow = Date.now();

    if ((tnow - tthen) > (1000 / targetFps)) {
        tthen = tnow - ((tnow - tthen) % (1000 / targetFps));
        //Game Logic
        if (!checkboxSafespotValue) ctx.clearRect(0, 0, canvasSize, canvasSize);
        bookArray.forEach(el => el.draw());
        bulletArray.forEach(el => el.draw());
        //Fps Counter
        const now = performance.now();
        while (fpsActivity[0] < now - 998) fpsActivity.shift();
        fpsActivity.push(now);
        document.getElementById("fpsCounter").innerText = fpsActivity.length;
    }
}

function resetGame() {
    timeoutArray.forEach(el => clearTimeout(el));
    timeoutArray = []
    bookArray = [];
    bulletArray = [];
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    gameMusic.load();
    gameMode = null;
}

function startNormalMode() {
    resetGame()
    gameMode = "normal"
    gameMusic.play();
    for (let i = 0; i < 6; i++) {
        timeoutArray.push(
            setTimeout(() => {
                bookArray.push(new Book({
                    x: Math.floor(Math.random() * 800),
                    y: Math.floor(Math.random() * 300)
                }))
            }, i * 1000)
        )
    }
}

function startLunaticMode() {
    resetGame()
    gameMode = "lunatic"

    gameMusic.play();

    for (let i = 0; i < 6; i++) {
        timeoutArray.push(
            setTimeout(() => {
                bookArray.push(new Book({
                    x: Math.floor(Math.random() * 800),
                    y: Math.floor(Math.random() * 300)
                }))
            }, i * 800))
    }
}

class Bullet {
    constructor({ x, y, vx, vy, typeBig, size = (typeBig ? 20 : 10), isStatic = false }) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.typeBig = typeBig;
        this.size = size;
        this.timer = 15;
        this.isStatic = isStatic;
    }
    draw() {
        //Despawn Out of Bounds
        if (this.x > canvas.width + 10 || this.x + 10 < 0 || this.y > canvas.height + 10 || this.y + 10 < 0) return;
        //Awful Mode
        if (checkboxAwfulValue) {
            if (this.x > canvas.width)
                this.vx *= -1;
            else if (this.x < 0)
                this.vx *= -1;
            else if (this.y > canvas.height)
                this.vy *= -1;
            else if (this.y < 0)
                this.vy *= -1;
        }
        //Logic
        ctx.save();
        if (this.isStatic) ctx.globalAlpha = this.timer / 30;
        ctx.drawImage(imageBigBullet, this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
        if (this.timer > 0)
            this.timer -= 1;
        this.x += this.vx * (this.timer * 0.2 + 1)*3;
        this.y += this.vy * (this.timer * 0.2 + 1)*3;

    }
    logic() {

    }
    collisionCheck() {

    }
}

class Book {
    constructor({ x, y }) {
        this.x = x;
        this.y = y;
        this.size = 40;
        this.timer = 0;
    }
    draw() {
        ctx.save();
        if (this.timer < 100) ctx.globalAlpha = this.timer * 0.01;
        ctx.drawImage(imageBookBackground, this.x - 60, this.y - 60);
        ctx.drawImage(imageBook, (this.x - this.size / 2), (this.y - this.size / 2) + Math.sin(this.timer * 0.03) * 4, this.size, this.size);
        ctx.restore();

        if (this.timer % 60 == 0) {
            //rng rotation
            let rot = Math.floor(Math.random() * 10)
            //Book Explosion
            bulletArray.push(new Bullet({
                x: this.x,
                y: this.y,
                size: 140,
                vx: 0,
                vy: 0,
                isStatic: true
            }));
            //Normal Mode
            if (gameMode == "normal") {
                let bulletCount = 11;
                for (let index = 0; index < bulletCount; index++) {
                    bulletArray.push(new Bullet({
                        x: this.x,
                        y: this.y,
                        vx: Math.cos(2 * Math.PI * (index + rot * 0.1) / bulletCount),
                        vy: Math.sin(2 * Math.PI * (index + rot * 0.1) / bulletCount),
                        typeBig: true
                    }));
                    bulletArray.push(new Bullet({
                        x: this.x,
                        y: this.y,
                        vx: Math.cos(2 * Math.PI * ((index + rot * 0.1) + 0.5) / bulletCount),
                        vy: Math.sin(2 * Math.PI * ((index + rot * 0.1) + 0.5) / bulletCount),
                        typeBig: false
                    }));
                }
            } else
            //Lunatic Mode
            if (gameMode == "lunatic") {
                let bulletCount = 15;
                for (let index = 0; index < bulletCount; index++) {
                    bulletArray.push(new Bullet({
                        x: this.x,
                        y: this.y,
                        vx: Math.cos(2 * Math.PI * (index + rot * 0.1) / bulletCount) * 1.2,
                        vy: Math.sin(2 * Math.PI * (index + rot * 0.1) / bulletCount) * 1.2,
                        typeBig: true
                    }));
                    bulletArray.push(new Bullet({
                        x: this.x,
                        y: this.y,
                        vx: Math.cos(2 * Math.PI * ((index + rot * 0.1) + 0.3) / bulletCount) * 1.2,
                        vy: Math.sin(2 * Math.PI * ((index + rot * 0.1) + 0.3) / bulletCount) * 1.2,
                        typeBig: false
                    }));
                }
                //Secondary
                timeoutArray.push(
                    setTimeout(() => {
                        //Big Bullet2
                        for (let index = 0; index < bulletCount; index++)
                            bulletArray.push(new Bullet({
                                x: this.x,
                                y: this.y,
                                vx: Math.cos(2 * Math.PI * (index + rot * 0.1) / bulletCount) * 1.4,
                                vy: Math.sin(2 * Math.PI * (index + rot * 0.1) / bulletCount) * 1.4,
                                typeBig: true
                            }));
                        //Small Bullet2
                        for (let index = 0; index < bulletCount; index++)
                            bulletArray.push(new Bullet({
                                x: this.x,
                                y: this.y,
                                vx: Math.cos(2 * Math.PI * ((index + rot * 0.1) + 0.3) / bulletCount) * 1.4,
                                vy: Math.sin(2 * Math.PI * ((index + rot * 0.1) + 0.3) / bulletCount) * 1.4,
                                typeBig: false
                            }));
                    }, 100))
            }

        }

        this.timer += 1;
    }
}

function handleClick(event) {
    gameMode = "normal"
    gameMusic.play();
    bookArray.push(new Book({
        x: event.clientX - canvas.offsetLeft,
        y: event.clientY - canvas.offsetTop
    }));

}

function checkboxSafespot() {
    const checkBox = document.getElementById("checkboxSafespot");
    checkboxSafespotValue = checkBox.checked ? true : false;
}

function checkboxAwful() {
    const checkBox = document.getElementById("checkboxAwful");
    checkboxAwfulValue = checkBox.checked ? true : false;
}

function checkboxUncapped() {
    const checkBox = document.getElementById("checkboxUncapped");
    targetFps = checkBox.checked ? 200 : 60;
}