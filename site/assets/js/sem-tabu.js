(function () {
  'use strict';

  // Lista de interesse do Sem Tabu. O formulário envia para o Google Apps Script (planilha
  // da Larissa) definido em data-endpoint. Sem endpoint, ou se o envio falhar, a inscrição
  // vira uma mensagem pronta no WhatsApp, para nenhum contato se perder.
  var form = document.getElementById('st-form');
  if (!form) return;
  var aviso = document.getElementById('st-aviso');
  var botao = form.querySelector('button[type="submit"]');
  var endpoint = form.getAttribute('data-endpoint') || '';
  var numero = '5551984723551';

  function campo(nome) { return form.elements[nome]; }
  function avisar(texto, tipo) {
    aviso.textContent = texto;
    aviso.className = 'st-form__aviso' + (tipo ? ' st-form__aviso--' + tipo : '');
  }
  function evento(nome, dados) {
    if (typeof window.gtag === 'function') window.gtag('event', nome, dados || {});
  }

  function origem() {
    var q = new URLSearchParams(location.search);
    return ['utm_source', 'utm_medium', 'utm_campaign'].map(function (k) { return q.get(k) || ''; })
      .filter(Boolean).join(' / ') || document.referrer || 'direto';
  }

  function mensagemWhats(d) {
    var linhas = ['Olá, Larissa! Quero entrar na lista de interesse do Sem Tabu.', 'Nome: ' + d.nome];
    if (d.email) linhas.push('E-mail: ' + d.email);
    if (d.cidade) linhas.push('Cidade: ' + d.cidade);
    if (d.idades) linhas.push('Idade dos filhos: ' + d.idades);
    if (d.duvida) linhas.push('Minha dúvida: ' + d.duvida);
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(linhas.join('\n'));
  }

  function concluir(d, viaWhats) {
    form.classList.add('st-form--enviado');
    aviso.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'st-form__aviso st-form__aviso--ok';
    var primeiro = d.nome.split(' ')[0];
    p.textContent = viaWhats
      ? 'Falta só um passo, ' + primeiro + ': envie a mensagem que abrimos no WhatsApp.'
      : 'Pronto, ' + primeiro + '! Você está na lista. Vamos avisar pelo WhatsApp assim que a data e o local forem confirmados.';
    aviso.appendChild(p);
    if (viaWhats) {
      var a = document.createElement('a');
      a.href = mensagemWhats(d); a.target = '_blank'; a.rel = 'noopener';
      a.className = 'btn btn--grande st-btn'; a.textContent = 'Abrir o WhatsApp';
      aviso.appendChild(a);
    }
    aviso.setAttribute('tabindex', '-1');
    aviso.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (campo('site').value) return; // robô

    var obrigatorios = [campo('nome'), campo('whatsapp')];
    var faltando = null;
    obrigatorios.forEach(function (c) {
      var vazio = !c.value.trim();
      c.setAttribute('aria-invalid', vazio ? 'true' : 'false');
      if (vazio && !faltando) faltando = c;
    });
    var digitos = campo('whatsapp').value.replace(/\D/g, '');
    if (!faltando && (digitos.length < 10 || digitos.length > 13)) {
      campo('whatsapp').setAttribute('aria-invalid', 'true');
      avisar('Confira o WhatsApp: precisa ter o DDD e o número.', 'erro');
      campo('whatsapp').focus();
      return;
    }
    if (faltando) {
      avisar('Preencha o seu nome e o WhatsApp.', 'erro');
      faltando.focus();
      return;
    }
    if (!campo('aceite').checked) {
      avisar('Para entrar na lista, marque que concorda com o uso dos dados.', 'erro');
      campo('aceite').focus();
      return;
    }

    var idades = Array.prototype.filter.call(form.querySelectorAll('input[name="idades"]'), function (c) { return c.checked; })
      .map(function (c) { return c.value; }).join(', ');
    var d = {
      nome: campo('nome').value.trim(),
      whatsapp: campo('whatsapp').value.trim(),
      email: campo('email').value.trim(),
      cidade: campo('cidade').value.trim(),
      idades: idades,
      duvida: campo('duvida').value.trim(),
      origem: origem(),
      aceite: 'sim'
    };

    evento('lista_sem_tabu', { com_duvida: d.duvida ? 'sim' : 'nao', origem: d.origem.slice(0, 90) });

    if (!endpoint) {
      window.open(mensagemWhats(d), '_blank', 'noopener');
      concluir(d, true);
      return;
    }

    botao.disabled = true;
    avisar('Enviando...');
    // no-cors: o Apps Script não devolve CORS; o pedido chega e a resposta fica opaca
    fetch(endpoint, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(d) })
      .then(function () { concluir(d, false); })
      .catch(function () {
        botao.disabled = false;
        window.open(mensagemWhats(d), '_blank', 'noopener');
        concluir(d, true);
      });
  });
})();
