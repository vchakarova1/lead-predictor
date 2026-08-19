document.addEventListener('DOMContentLoaded', () => {
  const totalRevenueInput = document.getElementById('total-revenue');
  const averageOrderValueInput = document.getElementById('average-order-value');
  const leadResponseRateInput = document.getElementById('lead-response-rate');
  const prospectResponseRateInput = document.getElementById('prospect-response-rate');
  const leadResponseValue = document.getElementById('lead-response-value');
  const prospectResponseValue = document.getElementById('prospect-response-value');
  const calculateButton = document.getElementById('calculate-button');
  const prospectsResult = document.getElementById('prospects-result');
  const leadsResult = document.getElementById('leads-result');
  const customersResult = document.getElementById('customers-result');
  const errorMessage = document.getElementById('error-message');
  const progressBars = {
    prospects: document.querySelector('.progress-bar--prospects'),
    leads: document.querySelector('.progress-bar--leads'),
    customers: document.querySelector('.progress-bar--customers')
  };
  const resultPercentNodes = document.querySelectorAll('.result-card .result-percent');
  const resultPercentLabels = {
    prospects: resultPercentNodes[0],
    leads: resultPercentNodes[1],
    customers: resultPercentNodes[2]
  };

  if (
    !totalRevenueInput ||
    !averageOrderValueInput ||
    !leadResponseRateInput ||
    !prospectResponseRateInput ||
    !leadResponseValue ||
    !prospectResponseValue ||
    !calculateButton ||
    !prospectsResult ||
    !leadsResult ||
    !customersResult ||
    !errorMessage ||
    !progressBars.prospects ||
    !progressBars.leads ||
    !progressBars.customers ||
    resultPercentNodes.length < 3 ||
    !resultPercentLabels.prospects ||
    !resultPercentLabels.leads ||
    !resultPercentLabels.customers
  ) {
    return;
  }

  function clearError() {
    errorMessage.textContent = '';
  }

  function showError(message) {
    errorMessage.textContent = message;
  }

  function updateSliderLabels() {
    const leadRate = Number.parseFloat(leadResponseRateInput.value) || 0;
    const prospectRate = Number.parseFloat(prospectResponseRateInput.value) || 0;

    leadResponseValue.textContent = `${leadRate.toFixed(2)}%`;
    prospectResponseValue.textContent = `${prospectRate.toFixed(2)}%`;
  }

  function updateChart(results) {
    const chartBars = document.querySelectorAll('.chart-bar');
    const chartContainer = document.querySelector('.chart-container');

    if (!chartBars.length || !chartContainer) {
      return;
    }

    const chartHeight = 250;
    const scaleMaximum = 120;
    const monthProgress = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
    const stackedData = monthProgress.map((progress) => ({
      prospects: Math.max(1, Math.ceil(results.prospects * progress)),
      leads: Math.max(1, Math.ceil(results.leads * progress)),
      customers: Math.max(1, Math.ceil(results.customers * progress))
    }));
    const finalMonth = stackedData[stackedData.length - 1];

    chartBars.forEach((bar, index) => {
      bar.innerHTML = '';

      const stack = document.createElement('div');
      stack.className = 'chart-bar-stack';

      const segments = [
        { className: 'chart-segment chart-segment--prospects', ratio: stackedData[index].prospects },
        { className: 'chart-segment chart-segment--leads', ratio: stackedData[index].leads },
        { className: 'chart-segment chart-segment--customers', ratio: stackedData[index].customers }
      ];

      const segmentTotal = segments.reduce((total, segment) => total + segment.ratio, 0);

      segments.forEach((segment) => {
        const node = document.createElement('span');
        node.className = segment.className;
        const segmentHeight = Math.max(8, (segment.ratio / segmentTotal) * 100);
        node.style.height = `${segmentHeight}%`;
        stack.appendChild(node);
      });

      bar.appendChild(stack);

      const monthLabel = document.createElement('span');
      monthLabel.className = 'bar-label';
      monthLabel.textContent = `Month #${index + 1}`;
      bar.appendChild(monthLabel);

      const baseHeight = chartHeight * Math.min(1, stackedData[index].prospects / scaleMaximum);
      bar.style.height = `${Math.max(80, Math.round(baseHeight))}px`;
      bar.style.minHeight = `${Math.max(80, Math.round(baseHeight))}px`;
      bar.style.transition = 'height 0.35s ease';

      bar.addEventListener('mouseenter', () => {
        tooltip.innerHTML = [
          `<strong>Month #${index + 1}</strong>`,
          `<span>Prospects: ${stackedData[index].prospects}</span>`,
          `<span>Leads: ${stackedData[index].leads}</span>`,
          `<span>Customers: ${stackedData[index].customers}</span>`
        ].join('');
      });
    });

    const tooltip = document.querySelector('.chart-tooltip') || document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.innerHTML = [
      '<strong>Month #6</strong>',
      `<span>Prospects: ${finalMonth.prospects}</span>`,
      `<span>Leads: ${finalMonth.leads}</span>`,
      `<span>Customers: ${finalMonth.customers}</span>`
    ].join('');

    if (!tooltip.parentElement) {
      chartContainer.appendChild(tooltip);
    }
  }

  function handleCalculate() {
    const values = getInputValues();

    if (!validateInputs(values)) {
      return;
    }

    const results = calculateResults(values);

    displayResults(results);
    updateProgressAndPercentages(results);
    updateChart(results);
    clearError();
  }

  function getInputValues() {
    return {
      totalRevenue: Number.parseFloat(totalRevenueInput.value),
      averageOrderValue: Number.parseFloat(averageOrderValueInput.value),
      leadResponseRate: Number.parseFloat(leadResponseRateInput.value),
      prospectResponseRate: Number.parseFloat(prospectResponseRateInput.value)
    };
  }

  function validateInputs(values) {
    if (totalRevenueInput.value.trim() === '') {
      showError('Моля, въведете общ оборот.');
      return false;
    }

    if (!Number.isFinite(values.totalRevenue)) {
      showError('Моля, въведете общ оборот.');
      return false;
    }

    if (values.totalRevenue <= 0) {
      showError('Общият оборот трябва да бъде по-голям от 0.');
      return false;
    }

    if (averageOrderValueInput.value.trim() === '') {
      showError('Моля, въведете средна стойност на поръчката.');
      return false;
    }

    if (!Number.isFinite(values.averageOrderValue)) {
      showError('Моля, въведете средна стойност на поръчката.');
      return false;
    }

    if (values.averageOrderValue <= 0) {
      showError('Средната стойност на поръчката трябва да бъде по-голяма от 0.');
      return false;
    }

    if (values.leadResponseRate < 1 || values.leadResponseRate > 100) {
      showError('Процентът трябва да бъде между 1% и 100%.');
      return false;
    }

    if (values.prospectResponseRate < 1 || values.prospectResponseRate > 100) {
      showError('Процентът трябва да бъде между 1% и 100%.');
      return false;
    }

    clearError();
    return true;
  }

  function calculateResults(values) {
    const customers = Math.ceil(values.totalRevenue / values.averageOrderValue);
    const leads = Math.ceil((customers * 100) / values.leadResponseRate);
    const prospects = Math.ceil((leads * 100) / values.prospectResponseRate);

    return {
      customers,
      leads,
      prospects
    };
  }

  function displayResults(results) {
    prospectsResult.textContent = results.prospects;
    leadsResult.textContent = results.leads;
    customersResult.textContent = results.customers;
  }

  function updateProgressAndPercentages(results) {
    const prospectsBase = results.prospects || 1;
    const leadsPercent = Math.min(100, Math.ceil((results.leads / prospectsBase) * 100));
    const customersPercent = Math.min(100, Math.ceil((results.customers / prospectsBase) * 100));

    resultPercentLabels.prospects.textContent = '100%';
    resultPercentLabels.leads.textContent = `${leadsPercent}%`;
    resultPercentLabels.customers.textContent = `${customersPercent}%`;

    progressBars.prospects.style.width = '100%';
    progressBars.leads.style.width = `${leadsPercent}%`;
    progressBars.customers.style.width = `${customersPercent}%`;
  }

  totalRevenueInput.addEventListener('input', handleCalculate);
  averageOrderValueInput.addEventListener('input', handleCalculate);
  leadResponseRateInput.addEventListener('input', () => {
    updateSliderLabels();
    handleCalculate();
  });

  prospectResponseRateInput.addEventListener('input', () => {
    updateSliderLabels();
    handleCalculate();
  });

  calculateButton.addEventListener('click', handleCalculate);

  updateSliderLabels();
  handleCalculate();
});
