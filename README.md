# X5R Pro Updater

This workspace now separates the page into three files:

- `index.html` for the structure and external references
- `styles.css` for the custom styling and animation definitions
- `script.js` for the UI behavior and state handling

Open `index.html` in a browser to run the updater UI.

Web Serial requires a secure context, so the connect flow only works from `http://localhost`, `https://`, or another secure origin. Opening the page directly with `file://` will usually prevent port access.

The Connect flow now uses `esptool-js` in the browser to identify the connected ESP chip and print the connection details into the on-page log.

The reset flow now disconnects the esptool transport before closing the Web Serial port so the device is fully released when you leave the update flow.

Progress updates are shown as whole-number percentages in the UI.