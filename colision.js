
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const CANTIDAD = 25, RADIO = 17;
let circulos = [], contador = 0, velocidadActual = 1, nivelVelocidad = "Inicial";

document.body.style.cssText = "margin:0;overflow:hidden";
canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;display:block;cursor:pointer";

function ajustarCanvas() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

function crearCirculo(inicial = false) {
    return {
        x: RADIO + Math.random() * (canvas.width - RADIO * 2),
        y: inicial ? RADIO + Math.random() * canvas.height * 0.65 : -RADIO,
        radio: RADIO,
        vx: (Math.random() - 0.5) * 2,
        vy: 0.5 + Math.random() * 0.8,
        gravedad: 0.08 + Math.random() * 0.04,
        rebote: 0.45 + Math.random() * 0.15,
        rotacion: Math.random() * Math.PI,
        giro: (Math.random() - 0.5) * 0.05,
        tiempoLimite: Date.now() + 5000
    };
}

for (let i = 0; i < CANTIDAD; i++) {
    circulos.push({
        ...crearCirculo(),
        y: -RADIO,
        activo: false,
        aparicion: Date.now() + i * 350
    });
}

function actualizarVelocidad() {
    velocidadActual = contador > 20 ? 2.5 : contador > 10 ? 1.7 : 1;
    nivelVelocidad = contador > 20 ? "Alta" : contador > 10 ? "Media" : "Inicial";
}

function dibujarCancha() {
    const w = canvas.width, h = canvas.height, m = Math.min(25, w * 0.02);

    ctx.fillStyle = "#21852d";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = i % 2 ? "rgba(130,210,65,.10)" : "rgba(0,65,10,.13)";
        ctx.fillRect(i * w / 10, 0, w / 10, h);
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);

    ctx.beginPath();
    ctx.moveTo(w / 2, m);
    ctx.lineTo(w / 2, h - m);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.14, 0, Math.PI * 2);
    ctx.stroke();

    const aw = w * 0.12, ah = h * 0.38, ay = (h - ah) / 2;
    ctx.strokeRect(m, ay, aw, ah);
    ctx.strokeRect(w - m - aw, ay, aw, ah);
    ctx.strokeRect(m, h * 0.39, aw * 0.4, h * 0.22);
    ctx.strokeRect(w - m - aw * 0.4, h * 0.39, aw * 0.4, h * 0.22);
}

function poligono(x, y, r, n, giro = 0) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
        const a = giro + i * Math.PI * 2 / n;
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function dibujarBalon(c) {
    const r = c.radio;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotacion);

    ctx.beginPath();
    ctx.ellipse(3, r * 0.8, r * 0.95, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.fill();

    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 1, 0, 0, r * 1.2);
    g.addColorStop(0, "white");
    g.addColorStop(0.7, "#eee");
    g.addColorStop(1, "#777");

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#171717";
    poligono(0, 0, r * 0.34, 5);

    for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5 - Math.PI / 2;
        poligono(Math.cos(a) * r * 0.77, Math.sin(a) * r * 0.77, r * 0.23, 5, a);
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#555";
    ctx.stroke();
    ctx.restore();
}

function reemplazarBalon(i) {
    circulos[i] = {
        ...crearCirculo(),
        y: -RADIO,
        activo: false,
        aparicion: Date.now() + 500 + Math.random() * 900
    };
}

function actualizar() {
    const ahora = Date.now();

    for (let i = 0; i < circulos.length; i++) {
        const c = circulos[i];

        if (!c.activo) {
            if (ahora >= c.aparicion) {
                c.activo = true;
                c.tiempoLimite = ahora + 5000;
            } else continue;
        }

        if (ahora >= c.tiempoLimite) {
            reemplazarBalon(i);
            continue;
        }

        c.vy += c.gravedad * velocidadActual;
        c.x += c.vx * velocidadActual;
        c.y += c.vy * velocidadActual;
        c.rotacion += c.giro * velocidadActual;

        if (c.x + RADIO >= canvas.width) {
            c.x = canvas.width - RADIO;
            c.vx = -Math.abs(c.vx);
        }
        if (c.x - RADIO <= 0) {
            c.x = RADIO;
            c.vx = Math.abs(c.vx);
        }
        if (c.y + RADIO >= canvas.height) {
            c.y = canvas.height - RADIO;
            c.vy = -Math.abs(c.vy) * c.rebote;
        }
        if (c.y + RADIO >= canvas.height - 1 && Math.abs(c.vy) < 1) {
            c.y = canvas.height - RADIO;
            c.vy = -1.5;
        }
    }
}

function dibujarMarcador() {
    const x = canvas.width - 245, y = 20;
    ctx.fillStyle = "rgba(8,25,12,.9)";
    ctx.beginPath();
    ctx.roundRect(x, y, 225, 82, 14);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "bold 19px Arial";
    ctx.fillText(`⚽ Puntos: ${contador}`, x + 15, y + 31);
    ctx.font = "15px Arial";
    ctx.fillText(`Velocidad: ${nivelVelocidad}`, x + 15, y + 59);
}

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    for (let i = circulos.length - 1; i >= 0; i--) {
        const c = circulos[i], dx = mx - c.x, dy = my - c.y;
        if (c.activo && dx * dx + dy * dy <= c.radio * c.radio) {
            contador++;
            actualizarVelocidad();
            reemplazarBalon(i);
            break;
        }
    }
});

function animar() {
    actualizar();
    dibujarCancha();
    circulos.forEach(c => {
        if (c.activo) dibujarBalon(c);
    });
    dibujarMarcador();
    requestAnimationFrame(animar);
}

actualizarVelocidad();
animar();
