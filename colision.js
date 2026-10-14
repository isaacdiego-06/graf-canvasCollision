
const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;

        this.colorOriginal = color;
        this.color = color;
        this.colorChoqueHasta = 0;
        this.text = text;
        this.speed = speed;

        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
    }

    draw(context) {
        context.beginPath();

        context.strokeStyle = this.color;
        context.fillStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";

        context.fillText(this.text, this.posX, this.posY);

        context.lineWidth = 2;
        context.arc(
            this.posX,
            this.posY,
            this.radius,
            0,
            Math.PI * 2,
            false
        );

        context.stroke();
        context.closePath();
    }

    update() {
        // Actualizar posición horizontal
        this.posX += this.dx;

        // Rebote en los bordes horizontales
        if (this.posX + this.radius > window_width) {
            this.posX = window_width - this.radius;
            this.dx = -Math.abs(this.dx);
        } else if (this.posX - this.radius < 0) {
            this.posX = this.radius;
            this.dx = Math.abs(this.dx);
        }

        // Actualizar posición vertical
        this.posY += this.dy;

        // Rebote en los bordes verticales
        if (this.posY + this.radius > window_height) {
            this.posY = window_height - this.radius;
            this.dy = -Math.abs(this.dy);
        } else if (this.posY - this.radius < 0) {
            this.posY = this.radius;
            this.dy = Math.abs(this.dy);
        }
    }
}

// Crear array de círculos
let circles = [];

// Generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20;

        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = Math.random() * (window_height - radius * 2) + radius;

        let color = `#${Math.floor(Math.random() * 16777215)
            .toString(16).padStart(6, "0")}`;

        let speed = Math.random() * 1 + 1;
        let text = `C${i + 1}`;

        circles.push(
            new Circle(x, y, radius, color, text, speed)
        );
    }
}

// Detectar colisiones y hacer rebotar los círculos

function detectarColisiones() {
    const ahora = performance.now();

    // Restaurar color cuando termina el destello
    circles.forEach(circle => {
        circle.color = ahora < circle.colorChoqueHasta
            ? "#0000FF"
            : circle.colorOriginal;
    });

    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            const c1 = circles[i];
            const c2 = circles[j];

            const dx = c2.posX - c1.posX;
            const dy = c2.posY - c1.posY;

            const distancia = Math.sqrt(dx * dx + dy * dy);
            const sumaRadios = c1.radius + c2.radius;

            if (distancia <= sumaRadios) {
                // Destello azul visible durante 180 ms
                c1.colorChoqueHasta = ahora + 180;
                c2.colorChoqueHasta = ahora + 180;

                c1.color = "#0000FF";
                c2.color = "#0000FF";

                // Dirección normal del choque
                const nx = distancia === 0 ? 1 : dx / distancia;
                const ny = distancia === 0 ? 0 : dy / distancia;

                // Separar los círculos para evitar que se encimen
                const traslape = sumaRadios - distancia;

                c1.posX -= nx * (traslape / 2 + 0.1);
                c1.posY -= ny * (traslape / 2 + 0.1);

                c2.posX += nx * (traslape / 2 + 0.1);
                c2.posY += ny * (traslape / 2 + 0.1);

                // Calcular velocidad relativa en la dirección del choque
                const velocidadRelativa =
                    (c2.dx - c1.dx) * nx +
                    (c2.dy - c1.dy) * ny;

                // Rebotar únicamente si se están acercando
                if (velocidadRelativa < 0) {
                    c1.dx += velocidadRelativa * nx;
                    c1.dy += velocidadRelativa * ny;

                    c2.dx -= velocidadRelativa * nx;
                    c2.dy -= velocidadRelativa * ny;
                }
            }
        }
    }
}


// Animación
function animate() {
    ctx.clearRect(0, 0, window_width, window_height);

    // Primero mover los círculos
    circles.forEach(circle => {
        circle.update();
    });

    // Después detectar colisiones y cambiar direcciones
    detectarColisiones();

    // Dibujar con el color correspondiente
    circles.forEach(circle => {
        circle.draw(ctx);
    });

    requestAnimationFrame(animate);
}

// Iniciar simulación
generateCircles(20);
animate();
