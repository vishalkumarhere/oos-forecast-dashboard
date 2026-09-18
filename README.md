# Out-of-Stock Forecast Dashboard

An operational dashboard for a supervised out-of-stock prediction model: feature importance, confusion matrix, and a ranked SKU risk list.

## What it demonstrates

- Translating a classification model (XGBoost / Random Forest) into a decision-support tool planners actually use
- Feature importance for lag-based and anomaly-derived features in demand forecasting
- Recall-first evaluation framing, appropriate when missing a real stockout risk costs more than a false alarm
- A ranked, actionable risk list instead of a raw probability dump

## Stack

Plain HTML/CSS/JS + Chart.js (CDN). No backend, no build step. Deploys as a static site.

## Author

Vishal Kumar — generalized from out-of-stock prediction work (XGBoost/Random Forest, 92% recall, +7% forecasting accuracy across 5 markets).
