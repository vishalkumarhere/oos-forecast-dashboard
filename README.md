# Out of Stock Forecast Dashboard

An operational dashboard for a supervised out of stock prediction model: a model comparison toggle, feature importance, a confusion matrix, and a ranked, filterable SKU risk list with a live probability threshold slider.

## What it demonstrates

- Translating a classification model into a decision support tool planners actually use, not a raw probability dump
- A model comparison (XGBoost versus Random Forest) with recall, precision, and F1 computed live from each model's own confusion matrix, so the numbers can never drift out of sync with each other
- Recall first evaluation framing: the finding panel quantifies the actual recall for precision tradeoff between the two models and states why the model that catches more real stockout risks is preferred even at a precision cost
- A confusion matrix rendered as a heatmap, not a bar chart, with cell shading proportional to count
- A market filter and a sortable table on the SKU risk list, plus a live threshold slider that reclassifies every SKU's risk tier and reports how many SKUs currently clear the bar, without hiding the rest

## Data

Model metrics, the confusion matrix counts for both models, SKU identifiers, and market names are synthetic and illustrative, generalized from a 5 market retail out of stock classification capstone project, not a real company's production numbers. The two models were deliberately given a real tradeoff (XGBoost higher recall, Random Forest higher precision) so the model comparison finding has something genuine to say rather than one model simply beating the other on every axis.

## Stack

Plain HTML, CSS, and JavaScript across three files (index.html, styles.css, app.js). Charts and the confusion matrix are hand built, no charting library. No backend, no build step. Deploys as a static site.

## Author

Vishal Kumar. Generalized from out of stock prediction work at Meijer (Data Science Associate capstone), XGBoost and Random Forest modeling, deployed model driving a measured on shelf availability improvement.
