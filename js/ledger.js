// js/features/ledger.js
function renderRateFreshness() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  const el = $('#rateFreshness');
  if (!el) return;
  if (!exchangeRatesUpdatedAt) {
    el.textContent = dict.ledgerRateNote;
    return;
  }
  el.textContent = dict.ledgerRateNote + '：' + fmtDateTime(new Date(exchangeRatesUpdatedAt));
}

function fetchExchangeRates() {
  const now = Date.now();
  if (exchangeRatesUpdatedAt && now - exchangeRatesUpdatedAt < RATE_MIN_INTERVAL) {
    renderRateFreshness();
    return;
  }
  fetch('https://er-api.com')
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data && data.rates) {
        const newRates = Object.assign({}, DEFAULT_RATES);
        ['USD', 'JPY', 'HKD', 'EUR', 'GBP', 'CNY'].forEach(function (cur) {
          if (data.rates[cur]) newRates[cur] = 1 / data.rates[cur];
        });
        exchangeRates = newRates;
        exchangeRatesUpdatedAt = Date.now();
        LS.set('exchangeRates', {
          rates: newRates,
          updatedAt: exchangeRatesUpdatedAt
        });
        renderRateFreshness();
        renderLedger();
        renderHome();
      }
    })
    .catch(function () {
      renderRateFreshness();
    });
}

function renderLedgerTags() {
  const wrap = $('#ledgerTags');
  if (!wrap) return;
  if (!ledgerCategories.length) {
    wrap.innerHTML = '';
    return;
  }
  wrap.innerHTML = ledgerCategories
    .map(function (cat) {
      return (
        '<div class="tag-chip-ledger-wrap">' +
        '<span class="tag-chip-ledger" data-cat="' +
        escapeHtml(cat) +
        '">' +
        escapeHtml(cat) +
        '</span>' +
        '<button class="tag-del-btn" type="button" data-del-cat="' +
        escapeHtml(cat) +
        '" title="刪除標籤" aria-label="刪除標籤">×</button>' +
        '</div>'
      );
    })
    .join('');
}

function renderLedger() {
  const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
  if (!$('#ledgerDate').value) $('#ledgerDate').value = todayKey();
  $('#ledgerDate').max = todayKey();

  const now = new Date();
  const thisMonth = now.getFullYear() + '-' + pad(now.getMonth() + 1);
  const monthItems = ledger.filter(function (item) {
    return item.date.startsWith(thisMonth);
  });

  let totalExpenseTWD = 0;
  let totalIncomeTWD = 0;
  monthItems.forEach(function (item) {
    if (item.type === 'income') totalIncomeTWD += item.amount;
    else totalExpenseTWD += item.amount;
  });

  const currentRate = exchangeRates[mainCurrency] || 1;
  const showExpense = Math.round(totalExpenseTWD / currentRate);
  const showIncome = Math.round(totalIncomeTWD / currentRate);
  const showBalance = showIncome - showExpense;
  const symbol = currencySymbols[mainCurrency] || '$';

  $('#monthExpenseTotal').textContent = symbol + ' ' + showExpense;
  $('#monthIncomeTotal').textContent = symbol + ' ' + showIncome;
  $('#monthBalanceTotal').textContent = symbol + ' ' + showBalance;
  $('#monthBalanceTotal').style.color = showBalance >= 0 ? 'var(--income-color)' : 'var(--expense-color)';

  const listWrap = $('#ledgerList');
  const listCard = listWrap ? listWrap.closest('.ledger-list-card') : null;
  const isBatch = typeof BatchCtrl !== 'undefined' && BatchCtrl.isActive('ledger');
  if (typeof BatchCtrl !== 'undefined') {
    BatchCtrl.renderToolbar(listCard, 'ledger');
  }

  if (!monthItems.length) {
    listWrap.innerHTML = '<div class="empty">' + dict.ledgerEmpty + '</div>';
    renderRateFreshness();
    return;
  }

  const sorted = monthItems.slice().sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  listWrap.innerHTML = sorted
    .map(function (item) {
      const isIncome = item.type === 'income';
      const sign = isIncome ? '+' : '-';
      const colorClass = isIncome ? 'income' : 'expense';
      let amountDisplay = '';
      let extraNote = '';

      if (item.currency && item.currency !== mainCurrency && item.originalAmount) {
        amountDisplay = sign + item.currency + ' ' + item.originalAmount;
        const converted = Math.round(item.amount / currentRate);
        extraNote = ' <span style="font-size:11px;color:var(--fg-dim)">(約 ' + symbol + converted + ')</span>';
      } else if (item.currency && item.currency === mainCurrency && item.originalAmount) {
        amountDisplay = sign + symbol + ' ' + item.originalAmount;
      } else {
        amountDisplay = sign + symbol + ' ' + Math.round(item.amount / currentRate);
      }

      const selected = isBatch && BatchCtrl.isSelected(item.id);
      const badgeHtml = isBatch
        ? '<span class="batch-chk-badge" style="top:50%;transform:translateY(-50%);"></span>'
        : '';
      const delBtnHtml = isBatch
        ? ''
        : '<button class="mini del ledger-del" data-id="' + item.id + '" title="刪除">×</button>';

      return (
        '<div class="ledger-item batch-selectable' +
        (selected ? ' is-selected' : '') +
        '" data-id="' +
        item.id +
        '" style="' +
        (isBatch ? 'padding-right:36px;cursor:pointer;' : '') +
        '">' +
        badgeHtml +
        '<div class="ledger-date">' +
        item.date.slice(5) +
        '</div>' +
        '<div class="ledger-cat">' +
        escapeHtml(item.category) +
        '</div>' +
        '<div class="ledger-note">' +
        escapeHtml(item.note || '-') +
        '</div>' +
        '<div class="ledger-amount ' +
        colorClass +
        '">' +
        amountDisplay +
        extraNote +
        '</div>' +
        delBtnHtml +
        '</div>'
      );
    })
    .join('');

  renderRateFreshness();
}

function initLedgerEvents() {
  fetchExchangeRates();

  const wrap = $('#ledgerTags');
  const inp = $('#ledgerCategory');
  if (wrap && inp && !inp.dataset.bound) {
    inp.dataset.bound = '1';
    inp.addEventListener('focus', function () {
      renderLedgerTags();
      wrap.classList.add('open');
    });
    wrap.addEventListener('click', function (e) {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const delBtn = e.target.closest('.tag-del-btn');
      if (delBtn) {
        e.stopPropagation();
        const catToDelete = delBtn.dataset.delCat;
        customConfirm(
          dict.ledgerDelTagTitle,
          dict.ledgerDelTagMsg.replace('{c}', escapeHtml(catToDelete)),
          dict.delete,
          dict.cancel,
          true
        ).then(function (ok) {
          if (!ok) return;
          ledgerCategories = ledgerCategories.filter(function (c) {
            return c !== catToDelete;
          });
          save('ledgerCategories');
          renderLedgerTags();
          toast(dict.ledgerTagDeleted);
        });
        return;
      }
      const btn = e.target.closest('.tag-chip-ledger');
      if (!btn) return;
      inp.value = btn.dataset.cat;
      wrap.classList.remove('open');
    });
    document.addEventListener('click', function (e) {
      if (wrap.classList.contains('open') && !inp.contains(e.target) && !wrap.contains(e.target)) {
        wrap.classList.remove('open');
      }
    });
  }

  const addBtn = $('#ledgerAddBtn');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.addEventListener('click', function () {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const type = $('#ledgerType').value;
      const currency = $('#ledgerCurrency').value;
      const amountRaw = parseFloat($('#ledgerAmount').value);
      const category = $('#ledgerCategory').value.trim() || '其他';
      const date = $('#ledgerDate').value || todayKey();
      const note = $('#ledgerNote').value.trim();

      if (!amountRaw || amountRaw <= 0) {
        toast(dict.ledgerAmountInvalid);
        $('#ledgerAmount').focus();
        return;
      }
      if (!date) {
        toast(dict.ledgerDateFuture);
        return;
      }
      if (date > todayKey()) {
        toast(dict.ledgerDateFuture);
        $('#ledgerDate').value = todayKey();
        return;
      }

      if (!ledgerCategories.includes(category)) {
        ledgerCategories.push(category);
        save('ledgerCategories');
      }

      const rateToBase = exchangeRates[currency] || 1;
      const amountInBase = amountRaw * rateToBase;
      ledger.push({
        id: uid(),
        type: type,
        currency: currency,
        originalAmount: amountRaw,
        amount: amountInBase,
        category: category,
        date: date,
        note: note,
        createdAt: Date.now()
      });
      save('ledger');
      $('#ledgerAmount').value = '';
      $('#ledgerNote').value = '';
      $('#ledgerCategory').value = '';
      renderLedger();
      renderHome();
      toast(dict.ledgerSaved);
    });
  }

  const listEl = $('#ledgerList');
  if (listEl && !listEl.dataset.bound) {
    listEl.dataset.bound = '1';
    listEl.addEventListener('click', function (e) {
      const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
      const row = e.target.closest('.ledger-item[data-id]');
      if (row && typeof BatchCtrl !== 'undefined' && BatchCtrl.isActive('ledger')) {
        BatchCtrl.toggle(row.dataset.id);
        return;
      }

      const btn = e.target.closest('.ledger-del');
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return;

      customConfirm(
        dict.confirmSingleTrashTitle || dict.ledgerConfirmDelTitle,
        dict.confirmSingleTrashMsg || dict.ledgerConfirmDelMsg,
        dict.ledgerDelOk,
        dict.cancel,
        true
      ).then(function (ok) {
        if (!ok) return;
        const target = ledger.find(function (x) {
          return x.id === id;
        });
        if (target) {
          const label = target.category + (target.note ? ' · ' + target.note : '');
          trash.push({
            id: uid(),
            type: 'ledger',
            title: label,
            data: target,
            deletedAt: Date.now()
          });
        }
        ledger = ledger.filter(function (x) {
          return x.id !== id;
        });
        save('trash');
save('ledger');
renderLedger();
renderHome();
toast((dict.movedToTrash || '已將 {n} 個項目移至垃圾桶').replace('{n}', 1));
});
});
}
const mainCurrencySelect = $('#mainCurrencySelect');
if (mainCurrencySelect && !mainCurrencySelect.dataset.bound) {
mainCurrencySelect.dataset.bound = '1';
mainCurrencySelect.value = mainCurrency;
mainCurrencySelect.addEventListener('change', function () {
const dict = window.I18N[currentLang] || window.I18N['zh-TW'];
mainCurrency = this.value;
LS.set('mainCurrency', mainCurrency);
renderLedger();
renderHome();
toast(dict.currencyChanged.replace('{c}', mainCurrency));
});
}
}