(() => {
  'use strict';

  const avvia = () => {
    const dashboard = document.getElementById('portfolio-dashboard');
    if (!dashboard) return;
    const byId = id => document.getElementById(id);
    const money = value => new Intl.NumberFormat('it-IT', {style:'currency', currency:'EUR', maximumFractionDigits:2}).format(value);
    const number = (value, digits=1) => new Intl.NumberFormat('it-IT', {minimumFractionDigits:digits, maximumFractionDigits:digits}).format(value);
    const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

    // sul sito cifrato i dati stanno nella pagina; nell'artefatto arrivano da portfolio.json
    const inline = byId('portfolio-data');
    (inline ? Promise.resolve().then(() => JSON.parse(inline.textContent)) : fetch('portfolio.json', {cache:'no-store'}).then(response => {
      if (!response.ok) throw new Error('Dati non disponibili');
      return response.json();
    })).then(data => {
      byId('data-status').textContent = 'Snapshot · ' + data.asof;
      byId('total').textContent = money(data.total);
      const profit = data.securities - data.costBasis;
      byId('profit').textContent = (profit >= 0 ? '+' : '−') + money(Math.abs(profit)) + ' sul carico';
      byId('profit').classList.add(profit >= 0 ? 'positive' : 'negative');
      byId('count').textContent = data.count + ' titoli';
      byId('invested').textContent = money(data.securities);
      byId('cash').textContent = money(data.cash);
      byId('usd').textContent = number(data.risk.usd,0) + '%';
      byId('beta').textContent = number(data.risk.beta,2);
      byId('vol').textContent = number(data.risk.vol,1) + '%';
      byId('drawdown').textContent = number(data.risk.dd,1) + '%';
      byId('risk-date').textContent = data.risk.data.split('-').reverse().join('/');
      const top = [...data.positions].sort((a,b) => b.value - a.value).slice(0,5);
      byId('holdings').innerHTML = top.map((position,index) => {
        const weight = position.value / data.total * 100;
        return `<div class="holding"><span class="holding-rank">${index+1}</span><span class="holding-name"><strong>${escape(position.name)}</strong><small>${escape(position.theme)}</small></span><span class="holding-value"><strong>${money(position.value)}</strong><small>${number(weight,1)}%</small></span></div>`;
      }).join('');
    }).catch(() => {
      byId('data-status').textContent = 'Snapshot non disponibile';
      byId('holdings').innerHTML = '<p class="loading">Apri la pagina con una connessione per salvare i dati più recenti.</p>';
    });
  };

  // la pagina può arrivare scritta da sblocca.js: si parte solo a documento pronto
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();
})();
