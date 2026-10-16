# Mettatec X5R Pro Firmware Updater

This project is a browser-based firmware updater for the Mettatec X5R Pro. It uses the browser's Web Serial API and `esptool-js` to connect to the device over USB, detect the ESP chip, and flash a bundled firmware image.

## Overview

The updater is a small static web app designed for X5R Pro devices that run Espressif firmware. It lets a user:

- connect the device over USB
- detect the ESP chip and revision
- load the correct firmware image set
- write the flash image to the board
- monitor progress through the UI
- reset the device after the update completes

This repository contains the UI, the updater logic, and the prebuilt firmware binaries used for flashing.

## Project structure

- `index.html` — main UI and layout
- `styles.css` — styling and animation
- `script.js` — firmware update logic, Web Serial handling, and flash process
- `bin_p4/` — firmware files for the ESP32-P4 image set
- `bin_p4x/` — firmware files for the ESP32-P4X image set
- `METTATEC-Logo.webp.png` — project branding

## Included firmware images

Each firmware directory contains:

- `bootloader.bin`
- `partition-table.bin`
- `ota_data_initial.bin`
- `x5r_pro.bin`

The updater chooses between `bin_p4/` and `bin_p4x/` based on the detected chip revision.

## How to use

Because Web Serial requires a secure context, the app must be served from a local web server or HTTPS origin, not opened directly as a `file://` page.

Start a local server from the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Use Chromium-based browsers such as Chrome, Edge, or Opera for Web Serial support.

1. Connect the X5R Pro to the computer via USB.
2. Click `Connect X5R Pro` in the web app.
3. Allow the browser to access the serial port.
4. The app detects the ESP chip and prepares the update.
5. Click `Update Now` to flash the firmware.
6. Wait for the update to finish and then disconnect the device.

## Notes

- The app is static and has no build step.
- The updater relies on `esptool-js` running in the browser.
- The project is intended for firmware recovery or upgrade workflows on Mettatec X5R Pro hardware.
- The update flow uses the browser's serial connection and only works in supported browsers.

## Requirements

- Chrome, Edge, or Opera
- Web Serial support enabled by the browser
- A connected X5R Pro device over USB
- A secure origin (`localhost` or HTTPS)

## Disclaimer

This project is meant for flashing approved firmware builds for the X5R Pro. Use only the bundled images or firmware versions intended for the target hardware to avoid damaging the device during flashing.