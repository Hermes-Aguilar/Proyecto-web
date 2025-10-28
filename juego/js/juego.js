const lienzo = document.getElementById('juego');
    const contexto = lienzo.getContext('2d');
    const cuadricula = 15;
    const altoPaleta = cuadricula * 5;
    const maxPaletaY = lienzo.height - cuadricula - altoPaleta;
    let velocidadPaleta = 8;
    let velocidadActual = 6;

    // referencias al marcador
    const puntajeIzqEl = document.getElementById('puntaje-izquierda');
    const puntajeDerEl = document.getElementById('puntaje-derecha');

    // variables de puntuación
    let puntajeIzq = parseInt(localStorage.getItem('puntajeIzq')) || 0;
    let puntajeDer = parseInt(localStorage.getItem('puntajeDer')) || 0;

    // música de fondo
    const musicaFondo = document.getElementById('musica-fondo');
    document.addEventListener('click', () => {
      if (musicaFondo.paused) {
        musicaFondo.volume = 0.5;
        musicaFondo.play();
      }
    });

    // imágenes
    const imagenMesa = new Image();
    imagenMesa.src = 'css/mesa_editada.png';
    const imagenPelota = new Image();
    imagenPelota.src = 'css/pelota.png';

    const paletaIzquierda = {
      x: cuadricula * 2,
      y: lienzo.height / 2 - altoPaleta / 2,
      ancho: cuadricula,
      alto: altoPaleta,
      dy: 0
    };

    const paletaDerecha = {
      x: lienzo.width - cuadricula * 3,
      y: lienzo.height / 2 - altoPaleta / 2,
      ancho: cuadricula,
      alto: altoPaleta,
      dy: 0
    };

    const pelota = {
      x: lienzo.width / 2,
      y: lienzo.height / 2,
      ancho: cuadricula * 2,
      alto: cuadricula * 2,
      reiniciando: false,
      dx: velocidadActual,
      dy: 0
    };

    // detección de colisiones
    function colisiona(a, b) {
      return a.x < b.x + b.ancho &&
             a.x + a.ancho > b.x &&
             a.y < b.y + b.alto &&
             a.y + a.alto > b.y;
    }

    // actualizar texto del marcador
    function actualizarPuntajes() {
      puntajeIzqEl.textContent = `Puntaje 1: ${puntajeIzq}`;
      puntajeDerEl.textContent = `Puntaje 2: ${puntajeDer}`;
      localStorage.setItem('puntajeIzq', puntajeIzq);
      localStorage.setItem('puntajeDer', puntajeDer);
    }

    // resetear puntajes
    function reiniciarPuntajes() {
      puntajeIzq = 0;
      puntajeDer = 0;
      localStorage.setItem('puntajeIzq', '0');
      localStorage.setItem('puntajeDer', '0');
      actualizarPuntajes();
    }

    let enPausa = true;
    let mostrarMensaje = true;

    function bucle() {
      requestAnimationFrame(bucle);
      contexto.clearRect(0, 0, lienzo.width, lienzo.height);

      contexto.drawImage(imagenMesa, 0, 0, lienzo.width, lienzo.height);

      if (mostrarMensaje) {
        contexto.fillStyle = 'rgba(0, 0, 0, 0.5)';
        contexto.fillRect(0, 0, lienzo.width, lienzo.height);
        contexto.fillStyle = 'white';
        contexto.font = '30px Arial';
        contexto.textAlign = 'center';
        contexto.fillText('Pulse ESPACIO para jugar', lienzo.width / 2, lienzo.height / 2);
        return;
      }

      if (enPausa) {
        contexto.fillStyle = 'rgba(0, 0, 0, 0.5)';
        contexto.fillRect(0, 0, lienzo.width, lienzo.height);
        contexto.fillStyle = 'white';
        contexto.font = '30px Arial';
        contexto.textAlign = 'center';
        contexto.fillText('PAUSA', lienzo.width / 2, lienzo.height / 2);
        return;
      }

      // mover paletas
      paletaIzquierda.y += paletaIzquierda.dy;
      paletaDerecha.y += paletaDerecha.dy;

      paletaIzquierda.y = Math.max(cuadricula, Math.min(paletaIzquierda.y, maxPaletaY));
      paletaDerecha.y = Math.max(cuadricula, Math.min(paletaDerecha.y, maxPaletaY));

      // dibujar paletas
      contexto.fillStyle = 'red';
      contexto.fillRect(paletaIzquierda.x, paletaIzquierda.y, paletaIzquierda.ancho, paletaIzquierda.alto);
      contexto.fillStyle = 'black';
      contexto.fillRect(paletaDerecha.x, paletaDerecha.y, paletaDerecha.ancho, paletaDerecha.alto);

      // mover pelota
      pelota.x += pelota.dx;
      pelota.y += pelota.dy;

      // rebote arriba/abajo
      if (pelota.y < cuadricula || pelota.y + cuadricula > lienzo.height - cuadricula) {
        pelota.dy *= -1;
      }

      // fuera de campo
      if ((pelota.x < 0 || pelota.x > lienzo.width) && !pelota.reiniciando) {
        const sacaDesdeIzq = pelota.x < 0;
        if (pelota.x < 0) {
          puntajeDer++;
        } else {
          puntajeIzq++;
        }
        actualizarPuntajes();

        const puntajeLider = Math.max(puntajeIzq, puntajeDer);
        velocidadActual = Math.min(5 + Math.floor(puntajeLider / 2), 16);

        pelota.reiniciando = true;
        setTimeout(() => {
          pelota.reiniciando = false;
          if (sacaDesdeIzq) {
            pelota.x = paletaIzquierda.x + paletaIzquierda.ancho + cuadricula;
            pelota.y = lienzo.height / 2;
            pelota.dx = velocidadActual;
          } else {
            pelota.x = paletaDerecha.x - pelota.ancho - cuadricula;
            pelota.y = lienzo.height / 2;
            pelota.dx = -velocidadActual;
          }
          pelota.dy = (Math.random() - 0.3) * velocidadActual * 1;
        }, 400);
      }

      // colisiones
      if (colisiona(pelota, paletaIzquierda)) {
        pelota.dx *= -1;
        pelota.x = paletaIzquierda.x + paletaIzquierda.ancho;
        let interseccionRelativaY = (paletaIzquierda.y + (paletaIzquierda.alto / 2)) - pelota.y;
        let interseccionNormalizadaY = interseccionRelativaY / (paletaIzquierda.alto / 2);
        pelota.dy = -interseccionNormalizadaY * velocidadActual;
        actualizarPuntajes();
      } else if (colisiona(pelota, paletaDerecha)) {
        pelota.dx *= -1;
        pelota.x = paletaDerecha.x - pelota.ancho;
        pelota.dy = (Math.random() - 0.5) * velocidadActual;
        actualizarPuntajes();
      }

      // dibujar pelota
      contexto.drawImage(imagenPelota, pelota.x, pelota.y, pelota.ancho, pelota.alto);
    }

    // controles
    document.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        if (mostrarMensaje) {
          mostrarMensaje = false;
          enPausa = false;
        } else {
          enPausa = !enPausa;
        }
      }

      if (!enPausa) {
        if (e.which === 38) paletaDerecha.dy = -velocidadPaleta;
        else if (e.which === 40) paletaDerecha.dy = velocidadPaleta;
        if (e.which === 87) paletaIzquierda.dy = -velocidadPaleta;
        else if (e.which === 83) paletaIzquierda.dy = velocidadPaleta;
      }

      if (e.code === 'KeyR') {
        reiniciarPuntajes();
      }
    });

    document.addEventListener('keyup', e => {
      if ([38, 40].includes(e.which)) paletaDerecha.dy = 0;
      if ([83, 87].includes(e.which)) paletaIzquierda.dy = 0;
    });

    // iniciar
    imagenMesa.onload = () => {
      actualizarPuntajes();
      pelota.dx = velocidadActual;
      pelota.dy = 5;
      requestAnimationFrame(bucle);
    };
