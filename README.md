# Residential art course booking demonstration

An independent, interactive demonstration of a clearer booking journey for a residential art-course venue. It is deliberately lightweight: plain HTML, CSS and JavaScript, with no database, framework or paid hosting dependency.

**[View the live demonstration](https://balindavenport.github.io/residential-art-course-booking-demo/)**

## What the demonstration shows

- Three realistic course listings with dates, accommodation choices and prices
- Availability statuses calculated from remaining capacity
- A three-step guest reservation journey (no payment and no data transmission)
- A waiting-list journey for a full course
- An owner view combining web and simulated telephone bookings
- Local browser storage so capacity changes survive a refresh
- Responsive, keyboard-friendly layouts

## Run locally

Open `index.html` directly, or serve the directory with any static web server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

This repository is ready for GitHub Pages from the repository root. In **Settings → Pages**, choose **Deploy from a branch**, select `main`, then choose `/(root)`.

## Important

This is an independent, unbranded proposal. All names, dates, prices and availability are illustrative. Forms update only the current browser and do not transmit or retain personal information online.
