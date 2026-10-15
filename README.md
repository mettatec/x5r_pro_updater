# X5R Pro Updater

This workspace now separates the page into three files:

- `index.html` for the structure and external references
- `styles.css` for the custom styling and animation definitions
- `script.js` for the UI behavior and state handling

Open `index.html` in a browser to run the updater UI.

Web Serial requires a secure context, so the connect flow only works from `http://localhost`, `https://`, or another secure origin. Opening the page directly with `file://` will usually prevent port access.

The Connect flow now uses `esptool-js` in the browser to identify the connected ESP chip and print the connection details into the on-page log.

After flashing, the updater now uses the official esptool-js reset API (`esploader.after("hard_reset")`) instead of manual serial line toggling.

The reset flow then disconnects the esptool transport before closing the Web Serial port so the device is fully released when you leave the update flow.

The bundled X5R Pro firmware images are compiled for the ESP32-P4 and use DIO flash mode. The browser updater must match that flash mode; forcing QIO can corrupt the flash transaction and stop the serial stream halfway through an update.

The ESP32-P4 reset path uses the classic DTR/RTS control pair from esptool-js rather than a single RTS pulse. A bare RTS-only toggle can leave some USB serial bridges in an unclear boot/reset state.

Progress updates are shown as whole-number percentages in the UI.