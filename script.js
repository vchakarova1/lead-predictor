document.addEventListener('DOMContentLoaded', () => {
	const DEFAULT_VALUES = {
		language: 'en',
		currency: 'usd',
		campaignStart: '2026-05-08',
		campaignEnd: '2026-11-04',
		totalRevenue: '10000',
		averageOrderValue: '1000',
		leadResponseRate: '40',
		prospectResponseRate: '20'
	};

	const inputs = {
		language: document.getElementById('language'),
		currency: document.getElementById('currency'),
		campaignStart: document.getElementById('campaign-start'),
		campaignEnd: document.getElementById('campaign-end'),
		totalRevenue: document.getElementById('total-revenue'),
		averageOrderValue: document.getElementById('average-order-value'),
		leadResponseRate: document.getElementById('lead-response-rate'),
		prospectResponseRate: document.getElementById('prospect-response-rate')
	};
	const leadResponseValue = document.getElementById('lead-response-value');
	const prospectResponseValue = document.getElementById('prospect-response-value');
	const calculateButton = document.getElementById('calculate-button');
	const forecastHelper = document.getElementById('forecast-helper');
	const errorMessage = document.getElementById('error-message');
	const resultNodes = {
		prospects: document.getElementById('prospects-result'),
		leads: document.getElementById('leads-result'),
		customers: document.getElementById('customers-result')
	};
	const progressBars = {
		prospects: document.querySelector('.progress-bar--prospects'),
		leads: document.querySelector('.progress-bar--leads'),
		customers: document.querySelector('.progress-bar--customers')
	};
	const percentageNodes = document.querySelectorAll('.result-card .result-percent');
	const chartBars = document.querySelectorAll('.chart-bar');
	const chartContainer = document.querySelector('.chart-container');

	function updateSliderLabels() {
		leadResponseValue.textContent = `${Number.parseFloat(inputs.leadResponseRate.value || 0).toFixed(2)}%`;
		prospectResponseValue.textContent = `${Number.parseFloat(inputs.prospectResponseRate.value || 0).toFixed(2)}%`;
	}

	function showHelper(message) {
		forecastHelper.textContent = message;
		forecastHelper.hidden = false;
	}

	function hideHelper() {
		forecastHelper.hidden = true;
	}

	function showError(message) {
		errorMessage.textContent = message;
	}

	function clearError() {
		errorMessage.textContent = '';
	}

	function getInputValues() {
		return {
			totalRevenue: Number.parseFloat(inputs.totalRevenue.value),
			averageOrderValue: Number.parseFloat(inputs.averageOrderValue.value),
			leadResponseRate: Number.parseFloat(inputs.leadResponseRate.value),
			prospectResponseRate: Number.parseFloat(inputs.prospectResponseRate.value)
		};
	}

	function validateInputs(values) {
		if (inputs.totalRevenue.value.trim() === '' || !Number.isFinite(values.totalRevenue)) {
			showError('Моля, въведете общ оборот.');
			return false;
		}
		if (values.totalRevenue <= 0) {
			showError('Общият оборот трябва да бъде по-голям от 0.');
			return false;
		}
		if (inputs.averageOrderValue.value.trim() === '' || !Number.isFinite(values.averageOrderValue)) {
			showError('Моля, въведете средна стойност на поръчката.');
			return false;
		}
		if (values.averageOrderValue <= 0) {
			showError('Средната стойност на поръчката трябва да бъде по-голяма от 0.');
			return false;
		}
		if (!Number.isFinite(values.leadResponseRate) || !Number.isFinite(values.prospectResponseRate) || values.leadResponseRate < 1 || values.leadResponseRate > 100 || values.prospectResponseRate < 1 || values.prospectResponseRate > 100) {
			showError('Процентът трябва да бъде между 1% и 100%.');
			return false;
		}
		return true;
	}

	function calculateForecast(values) {
		const customers = Math.ceil(values.totalRevenue / values.averageOrderValue);
		const leads = Math.ceil((customers * 100) / values.leadResponseRate);
		const prospects = Math.ceil((leads * 100) / values.prospectResponseRate);
		return { customers, leads, prospects };
	}

	function updateChart(results) {
		const chartHeight = 250;
		const scaleMaximum = 120;
		const monthProgress = [1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
		const monthlyData = monthProgress.map((progress) => ({
			prospects: Math.ceil(results.prospects * progress),
			leads: Math.ceil(results.leads * progress),
			customers: Math.ceil(results.customers * progress)
		}));
		let tooltip = chartContainer.querySelector('.chart-tooltip');

		if (!tooltip) {
			tooltip = document.createElement('div');
			tooltip.className = 'chart-tooltip';
			chartContainer.appendChild(tooltip);
		}

		chartBars.forEach((bar, index) => {
			const data = monthlyData[index];
			const total = data.prospects + data.leads + data.customers;
			bar.innerHTML = '';
			bar.classList.remove('is-zero');
			const height = Math.min(chartHeight, Math.max(0, chartHeight * data.prospects / scaleMaximum));
			bar.style.height = `${height}px`;
			bar.style.minHeight = `${height}px`;
			const stack = document.createElement('div');
			stack.className = 'chart-bar-stack';
			[['prospects', 'chart-segment chart-segment--prospects'], ['leads', 'chart-segment chart-segment--leads'], ['customers', 'chart-segment chart-segment--customers']].forEach(([key, className]) => {
				const segment = document.createElement('span');
				segment.className = className;
				segment.style.height = `${(data[key] / total) * 100}%`;
				stack.appendChild(segment);
			});
			bar.appendChild(stack);
			const label = document.createElement('span');
			label.className = 'bar-label';
			label.textContent = `Month #${index + 1}`;
			bar.appendChild(label);
			bar.onmouseenter = () => {
				tooltip.innerHTML = `<strong>Month #${index + 1}</strong><span>Prospects: ${data.prospects}</span><span>Leads: ${data.leads}</span><span>Customers: ${data.customers}</span>`;
			};
		});

		const finalMonth = monthlyData[monthlyData.length - 1];
		tooltip.innerHTML = `<strong>Month #6</strong><span>Prospects: ${finalMonth.prospects}</span><span>Leads: ${finalMonth.leads}</span><span>Customers: ${finalMonth.customers}</span>`;
	}

	function updateDashboard(results) {
		resultNodes.prospects.textContent = results.prospects;
		resultNodes.leads.textContent = results.leads;
		resultNodes.customers.textContent = results.customers;
		const prospectsBase = results.prospects || 1;
		const leadsPercent = Math.min(100, Math.ceil((results.leads / prospectsBase) * 100));
		const customersPercent = Math.min(100, Math.ceil((results.customers / prospectsBase) * 100));
		percentageNodes[0].textContent = '100%';
		percentageNodes[1].textContent = `${leadsPercent}%`;
		percentageNodes[2].textContent = `${customersPercent}%`;
		progressBars.prospects.style.width = '100%';
		progressBars.leads.style.width = `${leadsPercent}%`;
		progressBars.customers.style.width = `${customersPercent}%`;
		updateChart(results);
	}

	function clearForecast() {
		Object.values(resultNodes).forEach((node) => { node.textContent = '0'; });
		Object.values(progressBars).forEach((bar) => { bar.style.width = '0%'; });
		percentageNodes.forEach((node) => { node.textContent = '0%'; });
		chartBars.forEach((bar) => {
			bar.innerHTML = `<span class="bar-label">${bar.getAttribute('aria-label').replace('Month ', 'Month #')}</span>`;
			bar.classList.add('is-zero');
			bar.style.height = '0px';
			bar.style.minHeight = '0';
			bar.onmouseenter = null;
		});
		const tooltip = chartContainer.querySelector('.chart-tooltip');
		if (tooltip) tooltip.remove();
	}

	function resetForecast() {
		Object.entries(DEFAULT_VALUES).forEach(([key, value]) => {
			inputs[key].value = value;
		});
		updateSliderLabels();
		clearError();
		clearForecast();
		showHelper('Enter your campaign details to create a new forecast.');
	}

	function handleLiveChange() {
		hideHelper();
		updateSliderLabels();
		const values = getInputValues();
		if (!validateInputs(values)) return;
		clearError();
		updateDashboard(calculateForecast(values));
	}

	[inputs.language, inputs.currency, inputs.campaignStart, inputs.campaignEnd, inputs.totalRevenue, inputs.averageOrderValue, inputs.leadResponseRate, inputs.prospectResponseRate].forEach((input) => {
		input.addEventListener('input', handleLiveChange);
	});
	calculateButton.addEventListener('click', resetForecast);
	updateSliderLabels();
});
