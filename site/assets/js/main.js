(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cores = ['lilas', 'menta', 'sol', 'rosa', 'ceu'];
  var giros = [-4, 3, -2, 5, -3, 2, -5, 4, -1, 3];

  // Menu mobile
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var fecharMenu = function (devolverFoco) {
      nav.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      if (devolverFoco) toggle.focus();
    };
    toggle.addEventListener('click', function () {
      var aberto = nav.classList.toggle('active');
      toggle.classList.toggle('active', aberto);
      toggle.setAttribute('aria-expanded', aberto);
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    nav.querySelectorAll('.header__link').forEach(function (link) {
      link.addEventListener('click', function () { fecharMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) fecharMenu(true);
    });
  }

  // Sombra do header ao rolar
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('header--scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // Blocos de letra: inclinação, ordem da queda e balanço ao tocar
  function prepararBloco(bloco, i) {
    bloco.style.setProperty('--i', i);
    bloco.style.setProperty('--giro', giros[i % giros.length] + 'deg');
    if (semMovimento) return;
    bloco.addEventListener('pointerdown', function () {
      if (!bloco.classList.contains('bloco--balanca')) bloco.classList.add('bloco--balanca');
    });
    bloco.addEventListener('animationend', function (e) {
      if (e.animationName === 'balanca') bloco.classList.remove('bloco--balanca');
    });
  }
  document.querySelectorAll('.blocos').forEach(function (grupo) {
    grupo.querySelectorAll('.bloco').forEach(prepararBloco);
  });

  function criarBloco(texto, i) {
    var b = document.createElement('span');
    b.className = 'bloco bloco--' + cores[i % cores.length];
    b.textContent = texto;
    prepararBloco(b, i);
    return b;
  }

  // Hero: a queda só começa com a fonte certa carregada (teto de 800 ms)
  var heroBlocos = document.querySelector('.hero .blocos--cai');
  if (heroBlocos && !semMovimento && document.fonts && document.fonts.ready) {
    heroBlocos.classList.remove('blocos--cai');
    heroBlocos.classList.add('blocos--espera');
    var soltou = false;
    var soltar = function () {
      if (soltou) return; soltou = true;
      heroBlocos.classList.remove('blocos--espera');
      heroBlocos.classList.add('blocos--cai');
    };
    document.fonts.ready.then(soltar);
    setTimeout(soltar, 800);
  }

  // Fechamento: "VAMOS CONVERSAR?" cai uma vez, quando aparece na tela
  var fim = document.querySelector('.blocos--fim');
  if (fim) {
    if (semMovimento || !('IntersectionObserver' in window)) {
      fim.classList.add('blocos--cai');
    } else {
      var obsFim = new IntersectionObserver(function (entradas) {
        if (entradas[0].isIntersecting) { fim.classList.add('blocos--cai'); obsFim.disconnect(); }
      }, { threshold: 0.4 });
      obsFim.observe(fim);
    }
  }

  // Sinais: cada sinal marcado vira um bloco na bandeja, o nome do filho (opcional) também,
  // e a mensagem do WhatsApp aparece escrita antes de a mãe abrir o app
  var lista = document.getElementById('sinais-lista');
  if (lista) {
    var frase = document.getElementById('sinais-frase');
    var botao = document.getElementById('sinais-botao');
    var bandeja = document.getElementById('sinais-bandeja');
    var campoNome = document.getElementById('sinais-nome');
    var previa = document.getElementById('sinais-mensagem');
    var numero = '5551984723551';
    var fraseInicial = frase.firstChild.nodeValue;
    var ultimoNome = '';

    var limparNome = function (v) {
      return v.normalize('NFC').replace(/[^\p{L} ]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 20);
    };

    var atualizar = function () {
      var marcados = Array.prototype.filter.call(lista.querySelectorAll('.sinal'), function (s) {
        return s.getAttribute('aria-pressed') === 'true';
      }).map(function (s) { return s.textContent.trim().toLowerCase(); });
      var nome = campoNome ? limparNome(campoNome.value) : '';
      var primeiroNome = nome.split(' ')[0];

      // Bandeja: nome em blocos (refeito só quando o nome muda) + um bloco numerado por sinal
      if (nome !== ultimoNome || bandeja.children.length !== (primeiroNome ? 1 : 0) + marcados.length) {
        var linhaNome = null;
        if (primeiroNome) {
          linhaNome = document.createElement('span');
          linhaNome.className = 'blocos__linha bandeja__nome';
          primeiroNome.toUpperCase().slice(0, 10).split('').forEach(function (l, i) { linhaNome.appendChild(criarBloco(l, i)); });
        }
        var antigos = Array.prototype.slice.call(bandeja.querySelectorAll('.bandeja__sinal'));
        var novos = marcados.map(function (_, i) {
          var b = antigos[i] || criarBloco(String(i + 1), i + 2);
          b.classList.add('bandeja__sinal');
          return b;
        });
        bandeja.replaceChildren.apply(bandeja, (linhaNome ? [linhaNome] : []).concat(novos));
        ultimoNome = nome;
      }

      var msg;
      if (marcados.length === 0) {
        frase.firstChild.nodeValue = fraseInicial;
        msg = primeiroNome
          ? 'Olá, Larissa! Vi a lista de sinais no site e gostaria de conversar sobre ' + primeiroNome + '.'
          : 'Olá, Larissa! Vi a lista de sinais no site e gostaria de conversar sobre o meu filho.';
        previa.textContent = '';
      } else {
        frase.firstChild.nodeValue = (marcados.length === 1 ? 'Você marcou 1 sinal' : 'Você marcou ' + marcados.length + ' sinais')
          + (marcados.length === 1 ? '. Ele já vai' : '. Eles já vão') + ' na mensagem' + (primeiroNome ? ' sobre ' + primeiroNome : '') + '; você só aperta enviar.';
        msg = 'Olá, Larissa! Vi a lista de sinais no site e reconheci ' + (primeiroNome ? 'em ' + primeiroNome : 'no meu filho')
          + ': ' + marcados.join('; ') + '. Gostaria de conversar.';
        previa.textContent = msg;
      }
      botao.href = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(msg);
    };

    lista.querySelectorAll('.sinal').forEach(function (s) {
      s.addEventListener('click', function () {
        s.setAttribute('aria-pressed', s.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        atualizar();
      });
    });
    if (campoNome) campoNome.addEventListener('input', atualizar);
  }

  // Botão flutuante do WhatsApp some quando já existe um botão de WhatsApp na tela
  var flutuante = document.querySelector('.whatsapp-float');
  if (flutuante && 'IntersectionObserver' in window) {
    var visiveis = new Set();
    var alvos = document.querySelectorAll('.hero__acoes, .sinais__resultado, .fechamento__acoes, .pagina-topo .btn--acao, .contato__cta');
    var obsFlut = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) visiveis.add(e.target); else visiveis.delete(e.target); });
      var esconder = visiveis.size > 0;
      flutuante.classList.toggle('whatsapp-float--oculto', esconder);
      if (esconder) flutuante.setAttribute('tabindex', '-1'); else flutuante.removeAttribute('tabindex');
    }, { threshold: 0.2 });
    alvos.forEach(function (a) { obsFlut.observe(a); });
  }

  // Transição entre páginas: o bloco do serviço tocado vira o bloco do topo da página interna
  document.querySelectorAll('.servico').forEach(function (link) {
    link.addEventListener('click', function () {
      var b = link.querySelector('.bloco');
      if (b) b.style.viewTransitionName = 'bloco-servico';
    });
  });
  // Aviso de cookies (LGPD): o Google Analytics só grava cookies depois do "Aceitar"
  var escolha = null;
  try { escolha = localStorage.getItem('ln-cookies'); } catch (e) {}
  if (!escolha && typeof window.gtag === 'function') {
    var aviso = document.createElement('div');
    aviso.className = 'cookies';
    aviso.setAttribute('role', 'region');
    aviso.setAttribute('aria-label', 'Aviso de cookies');
    aviso.innerHTML = '<p>Uso cookies do Google Analytics para entender como o site é visitado. <a href="/privacidade/">Saiba mais</a></p>' +
      '<div class="cookies__botoes"><button type="button" class="btn btn--contorno" data-escolha="recusado">Recusar</button>' +
      '<button type="button" class="btn btn--acao" data-escolha="aceito">Aceitar</button></div>';
    aviso.addEventListener('click', function (e) {
      var b = e.target.closest('[data-escolha]');
      if (!b) return;
      var v = b.getAttribute('data-escolha');
      try { localStorage.setItem('ln-cookies', v); } catch (err) {}
      if (v === 'aceito') window.gtag('consent', 'update', { analytics_storage: 'granted' });
      aviso.remove();
    });
    document.body.appendChild(aviso);
  }

  // Eventos para o Analytics: contatos pelo WhatsApp e download do PDF de palestras
  function evento(nome, dados) {
    if (typeof window.gtag === 'function') window.gtag('event', nome, dados || {});
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var secao = a.closest('section[id], header, footer');
    var local = secao ? (secao.id || secao.tagName.toLowerCase()) : 'pagina';
    if (a.id === 'sinais-botao') {
      evento('sinais_whatsapp', { quantidade: document.querySelectorAll('.sinal[aria-pressed="true"]').length });
    } else if (href.indexOf('wa.me/') !== -1) {
      evento('contato_whatsapp', { local: local, pagina: location.pathname });
    } else if (/\.pdf($|\?)/.test(href)) {
      evento('download_pdf', { arquivo: href.split('/').pop() });
    } else if (href.indexOf('hotmart.com') !== -1) {
      evento('clique_guia_desfralde', { pagina: location.pathname });
    }
  });
})();
