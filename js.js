var bgc = document.getElementsByName("ccolor")[0];
var cs = document.getElementsByName("cs")[0]; // canvas scale
var bc = document.getElementsByName("bc")[0]; // brush color
var bs = document.getElementsByName("bs")[0]; // brush size

window.addEventListener("load", function () {
	var canvass = document.getElementsByTagName("canvas"),
		canvas = canvass[0],
		canvas2 = canvass[1],
		width = canvas.width = canvas2.width = window.innerWidth,
		height = canvas.height = canvas2.height = window.innerHeight;

	var Paint = {
		brush: {
			color: { value: "black" },
			size: { value: 5 }
		},
		canv: {
			bg: { value: "white" },
			scale: { value: 1 },
		},
		create: function (canvas) {
			obj = Object.create(this)
			obj.x = obj.y = obj.w = obj.h = 5;
			obj.spath = false;
			obj.canvas = canvas;
			obj.context = obj.canvas.getContext("2d");

			document.addEventListener("change", function (event) {
				obj.config()
			})
			document.addEventListener("keydown", (event) => obj.handleKey(event));
			document.addEventListener("mousemove", (event) => obj.handleMouse(event));
			document.addEventListener("click", (event) => obj.draw(event));
			document.addEventListener("keyup", (event) => obj.handleRelease(event));

			return obj;
		},
		test: function () {
			width = this.canvas.width;
			height = this.canvas.height;
			this.context.save();
			this.context.beginPath()
			this.context.lineWidth = 10;
			this.context.moveTo(width / 4, height / 4)
			this.context.lineTo(width, height)
			this.context.stroke()
			this.context.restore()
		},
		handleRelease: function (event) {
			if (event.keyCode == 17)
				this.spath = false;
			this.context.beginPath()
		},
		draw: function (event) {
			this.x = event.clientX;
			this.y = event.clientY;
			r = this.brush.size.value;

			this.context.save();
			this.context.beginPath();
			this.context.lineWidth = 0 + "px";
			this.context.stroke();
			this.context.restore();
		},
		handleMouse: function (event) {
			if (this.spath == false)
				this.context.beginPath();
			this.x = event.clientX;
			this.y = event.clientY;
			this.context.arc(this.x - this.w / 2, this.y - this.h / 2, 0, 0, Math.PI * 2);
		},
		handleKey: function (event) {
			console.log("event.keyCode")
			this.config();

			if (event.keyCode == 61) {
				this.brush.size.value++;
			} else if (event.keyCode == 173) {
				this.brush.size.value--;
			}
			if (event.keyCode == 17) {
				this.spath = true;
				this.context.stroke();
			}
			if (event.keyCode == 16) {
				this.context.clearRect(this.x - 20, this.y - 20, 40, 40);
			}
			if (event.keyCode == 69) {
				this.context.clearRect(0, 0, width, height);
				this.context.save();
			}
		},
		config: function () {
			obj.canvas.style.cssText = "transform: scale(" + this.canv.scale.value + ");";
			obj.canvas.style.backgroundColor = this.canv.bg.value;
			obj.context.lineWidth = this.brush.size.value;
			obj.context.strokeStyle = this.brush.color.value;

		}
	}
	p1 = Paint.create(canvas)

	var ball = {
		tcanv: null,
		speedx: 0,
		speedy: 0,
		accly: 0,
		attrs: 0,
		fric: 0.9,
		gravity: 0.9,
		bounce: 0.7,
		bsize: 50,
		attrpx: width / 2,
		attrpy: height / 2,
		attrf: 1,
		x: width / 2,
		y: 50, // Must be same as bsize
		r: 0,
		g: 0,
		b: 0,

		create: function (canvas) {
			var obj = Object.create(this)
			obj.canvas = canvas;
			obj.context = obj.canvas.getContext("2d");
			obj.wall = width || 0
			obj.ground = height || 0
			console.log("Object created")

			document.addEventListener("mousedown", function (event) {
				obj.attrs = 0.1;
				obj.bounce = 0;
				obj.gravity = 0;
				obj.accly = 0;
				obj.attrf = 0.8;
			});
			document.addEventListener("mouseup", function (event) {
				obj.attrs = 0;
				obj.bounce = 0.7;
				obj.gravity = 0.9;
				obj.attrf = 1;
			});
			document.addEventListener("mousemove", function (event) {
				obj.attrpx = event.clientX;
				obj.attrpy = event.clientY;
			});

			return obj;
		},
		update: function () {
			this.speedx *= this.attrf;
			this.speedx += (this.attrpx - this.x) * this.attrs;
			this.x += this.speedx;

			this.accly = 0;
			this.accly += this.gravity;
			this.speedy += this.accly;
			this.speedy *= this.attrf;
			this.speedy += (this.attrpy - this.y) * this.attrs;

			t = (this.y * 1) + this.speedy
			for (i = this.y; i < t; i += 1) {
				cam = this.getCam(canvas)
				if (cam.data[3] > 0) {
					this.speedy = i - this.y - 1;
					break;
				}
				// console.log(i)
			}

			this.y += this.speedy;

			this.collide();

			if (this.r > 255) this.r = 255;
			if (this.g > 255) this.g = 255;
			if (this.b > 255) this.b = 255;
			if (this.r < 0) this.r = 0;
			if (this.g < 0) this.g = 0;
			if (this.b < 0) this.b = 0;

		},
		getCam: function (canvas) {
			campos = {
				x: this.x,
				y: this.y + this.bsize
			}
			targetContext = canvas.getContext("2d");
			cam = targetContext.getImageData(campos.x, campos.y, 1, 1)
			return {
				x: campos.x,
				y: campos.y,
				data: cam.data
			}
		},
		collide: function () {
			cam = this.getCam(canvas);
			if (this.x < this.bsize) {
				this.x = this.bsize;
				this.speedx = -(this.speedx * this.bounce);
				this.r += Math.floor(70 * this.bounce);
				this.g -= Math.floor(20 * this.bounce);
				this.b -= Math.floor(20 * this.bounce);
			}
			if (this.x > this.wall - this.bsize) {
				this.x = this.wall - this.bsize;
				this.speedx = -(this.speedx * this.bounce);
				this.b += Math.floor(70 * this.bounce);
				this.g -= Math.floor(20 * this.bounce);
				this.r -= Math.floor(20 * this.bounce);
			}
			if (this.y < this.bsize) {
				this.y = this.bsize;
				this.speedy = -(this.speedy * this.bounce);
				this.g += Math.floor(70 * this.bounce);
				this.r -= Math.floor(20 * this.bounce);
				this.b -= Math.floor(20 * this.bounce);
			}
			if (this.y > this.ground - this.bsize) {
				this.y = this.ground - this.bsize;
				this.speedx *= this.fric;
				this.speedy = -(this.speedy * this.bounce);
			}
			if (cam.data[3] > 0) {
				this.colliding = true;
				this.accly = 0;
				this.speedx *= this.fric;
				this.speedy = -(this.speedy * this.bounce)
			} else this.colliding = false;

		},
		render: function () {
			view = 1

			this.update();

			cam = this.getCam(canvas)

			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

			// Camera drawing
			// this.context.beginPath();
			// this.context.arc(cam.x,cam.y,10,0,Math.PI*2)
			// this.context.fill()

			// Ball drawing
			this.context.beginPath();
			this.context.arc(this.x, this.y, this.bsize, 0, Math.PI * 2);
			this.context.fillStyle = "rgb(" + this.r + "," + this.g + "," + this.b + ")";
			this.context.fill();

			// console.log(" cam : "+cam.data)

		}
	}
	b1 = ball.create(canvas2)

	start()
	function start() {
		b1.render()
		requestAnimationFrame(start);
	}

});

function hdsw() {
	var sldbtn = document.getElementById("sldbtn");
	var cont = document.getElementsByClassName("cont")[0];
	if (cont.style.left == "0%") {
		cont.style.cssText = "left: -90%;";
		document.getElementById("sldbtn").innerHTML = ">";
	} else {
		cont.style.cssText = "left: 0%;";
		document.getElementById("sldbtn").innerHTML = "<";
	}
}

