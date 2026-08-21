# LeadPredictor

LeadPredictor is a browser-based calculator for estimating the number of prospects, leads, and customers needed to reach a target revenue. It presents the forecast in a dashboard with summary cards and a six-month performance chart.

## Features

- Calculates customers, leads, and prospects from campaign revenue and response rates.
- Updates the forecast live when the revenue, average order value, or response-rate sliders change.
- Displays results in Prospects, Leads, and Customers summary cards.
- Renders a dynamic six-month stacked bar chart.
- Shows a tooltip with the monthly Prospects, Leads, and Customers values when hovering over a chart bar.
- Validates revenue, average order value, and response-rate values.
- Provides a demo state on initial page load.
- Supports starting a new forecast without reloading the page.
- Includes language and currency selectors currently set to English and US Dollar.

## How the Calculator Works

The calculator uses the following inputs:

- **Total Revenue**: the target revenue amount.
- **Avg. Order Value**: the expected revenue from one order.
- **Lead Response Rate**: the percentage of leads expected to become customers.
- **Prospect Response Rate**: the percentage of prospects expected to become leads.

The calculations use `Math.ceil`, so the results are always rounded up to whole people or opportunities.

### Customers

```text
customers = ceil(totalRevenue / averageOrderValue)
```

### Leads

```text
leads = ceil((customers * 100) / leadResponseRate)
```

### Prospects

```text
prospects = ceil((leads * 100) / prospectResponseRate)
```

The chart uses the calculated final values to create six progressive monthly data points. Its vertical scale is limited to 0–120 for visual sizing, so large values can reach the chart's maximum height.

## Technologies Used

- HTML
- CSS
- JavaScript

The project uses no external libraries or frameworks.

## How to Run Locally

1. Clone or download the repository.
2. Open the project folder in a code editor.
3. Open `index.html` directly in a browser, or serve the folder with a local development server.

For example, with Python installed:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/index.html
```

A VS Code Live Server extension can also be used to serve `index.html` locally.

## Project Structure

```text
lead-predictor/
├── index.html   # Dashboard markup and form controls
├── style.css    # Layout, chart, cards, and responsive styles
├── script.js    # Validation, calculations, live updates, reset behavior, and tooltip logic
└── README.md    # Project documentation
```

## Usage Instructions

1. Open the application in a browser.
2. Review the demo values shown in the result cards and chart.
3. Change **Total Revenue** or **Avg. Order Value** to update the forecast.
4. Adjust **Lead Response Rate** and **Prospect Response Rate** with the sliders.
5. Review the updated Prospects, Leads, and Customers cards.
6. Hover over a chart bar to view its monthly tooltip.
7. Select **Start new forecast** to clear the current results and chart and prepare a new forecast.
8. Enter or adjust numeric forecast values after the reset to calculate a new result.

Revenue and average order value must be greater than zero. Both response rates must be between 1% and 100%.

## Calendar and Start New Forecast Behavior

The **Campaign Start** and **Campaign End** date fields are independent from the forecast logic. Changing either date only changes that date input; it does not recalculate the forecast, redraw the chart, or change the helper message.

The **Start new forecast** button:

- Resets Total Revenue, Avg. Order Value, Lead Response Rate, and Prospect Response Rate to their default values.
- Clears the Prospects, Leads, and Customers results to zero.
- Clears the chart bars and removes the active chart tooltip.
- Shows the message: `Enter your campaign details to create a new forecast.`
- Keeps the currently selected campaign start and end dates unchanged.

After any numeric input or slider is changed, the helper message is hidden and the forecast is recalculated live using the current numeric values.
> Temporary note: This line will be removed after review.