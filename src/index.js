const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var isDrawing = false;
var tipSize = 2;
var password_length = 16;
var points = 0;
ctx.fillStyle = "black";

const coordinates = [];

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function Draw(event, canvas) {
    var pos = getMousePos(canvas, event);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, tipSize, 0, Math.PI * 2);
    ctx.fill();
    coordinates.push({ x: pos.x, y: pos.y, time_stamp: Date.now() });
    convertToString();

    points += 1;
    document.getElementById("points").innerHTML = points;
}

async function convertToString() {
    if (coordinates.length > 0) {
        const inputString = JSON.stringify(coordinates) + ctx.fillStyle.toString(); //Adding color as Salt (this is mostly for fun, since it doesn't add any noticeable entropy)
        console.log(inputString);
        const encoder = new TextEncoder();
        const data = encoder.encode(inputString);

        const hashBuffer = await crypto.subtle.digest('SHA-256', data); //Using SHA-256 to compress data to given length, max. 32 characters since with a bigger charset we need 8bits per character, if we use base64 encoding we could use 6bits per character to get around 44 characters
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        var password = "";
        for (let i = 0; i < password_length; i++) {
            password += charset[hashArray[i % hashArray.length] % charset.length];
        }

        document.getElementById("password").innerHTML = password;
    }
}

// Buttons: 

function changeColor(clr) {
    ctx.fillStyle = clr;
    console.log("[Log] Changed color to: ", clr);
}

function clearCanvas(canvas) {
    ctx.clearRect(0, 0, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
    coordinates.length = 0;
    points = 0;
    document.getElementById("password").innerHTML = "";
    document.getElementById("points").innerHTML = points;
    console.log("[Log] Cleared Canvas");
}

// Mouse Controls: 

c.addEventListener('mousedown', function () {
    isDrawing = true;
});

c.addEventListener('mouseup', function () {
    isDrawing = false;
});

c.addEventListener('mouseleave', function () {
    isDrawing = false;
});

c.addEventListener('mousemove', function (event) {
    if (isDrawing) {
        Draw(event, c);
    }
});

// Sliders: 

var tip_slider = document.getElementById("tipRange");

tip_slider.oninput = function () {
    tipSize = this.value;
}

var length_slider = document.getElementById("lengthRange");

length_slider.oninput = function () {
    password_length = this.value;
    convertToString();
}
