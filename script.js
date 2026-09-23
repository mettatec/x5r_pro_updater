import { ESPLoader, Transport } from "https://unpkg.com/esptool-js/bundle.js";

async function fetchBinary(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url} (${response.status})`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function buildFlashOptions(onProgress) {
  const fileArray = [
    { data: await fetchBinary("/bin/bootloader.bin"), address: 0x2000 },
    { data: await fetchBinary("/bin/partition-table.bin"), address: 0x8000 },
    { data: await fetchBinary("/bin/ota_data_initial.bin"), address: 0xf000 },
    { data: await fetchBinary("/bin/x5r_pro.bin"), address: 0x20000 },
  ];

  return {
    fileArray,
    flashMode: "qio",
    flashFreq: "80m",
    flashSize: "16MB",
    eraseAll: false,
    compress: true,
    reportProgress: onProgress,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const panels = {
    connect: document.getElementById("panelConnect"),
    checking: document.getElementById("panelChecking"),
    updateAction: document.getElementById("panelUpdateAction"),
    progress: document.getElementById("panelProgress"),
    success: document.getElementById("panelSuccess"),
  };

  const badge = document.getElementById("statusBadge");
  const badgeText = document.getElementById("statusText");
  const termLog = document.getElementById("terminalLog");
  const bar = document.getElementById("progressBar");
  const pct = document.getElementById("progressPercent");
  const prgTxt = document.getElementById("progressText");
  const currentVersionLabel = document.getElementById("lblCurrentVer");
  const btnConnect = document.getElementById("btnConnect");
  const btnStartUpdate = document.getElementById("btnStartUpdate");
  const btnDone = document.getElementById("btnDone");
  let serialPort = null;
  let esploader = null;
  let transport = null;

  function showPanel(panelName) {
    Object.values(panels).forEach((panel) => {
      panel.classList.remove("z-10", "opacity-100");
      panel.classList.add("z-0", "opacity-0", "pointer-events-none");
    });

    const active = panels[panelName];
    active.classList.remove("z-0", "opacity-0", "pointer-events-none");
    active.classList.add("z-10", "opacity-100");
  }

  function setStatus(state) {
    badge.className =
      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors";

    if (state === "connected") {
      badge.classList.add("bg-green-100", "text-green-700");
      badge.innerHTML = '<i class="ph-fill ph-plug"></i><span>Connected</span>';
      badgeText.textContent = "Connected";
      return;
    }

    if (state === "updating") {
      badge.classList.add("bg-sky-100", "text-sky-700");
      badge.innerHTML =
        '<div class="animate-spin h-3 w-3 border-2 border-sky-600 border-t-transparent rounded-full"></div><span>Updating...</span>';
      badgeText.textContent = "Updating...";
      return;
    }

    badge.classList.add("bg-slate-100", "text-slate-500");
    badge.innerHTML =
      '<i class="ph-fill ph-plug"></i><span>Disconnected</span>';
    badgeText.textContent = "Disconnected";
  }

  function logMsg(msg) {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    termLog.innerHTML += `[${time}] ${msg}\n`;
    termLog.parentElement.scrollTop = termLog.parentElement.scrollHeight;
  }

  const terminal = {
    clean() {
      termLog.innerHTML = "";
      console.log("Terminal cleaned");
    },
    writeLine(data) {
      logMsg(data);
      console.log(data);
    },
    write(data) {
      termLog.innerHTML += data;
      termLog.parentElement.scrollTop = termLog.parentElement.scrollHeight;
      console.log(data);
    },
  };

  async function connectWithEsptool() {
    return await esploader;
  }

  async function handleConnect() {
    try {
      if (!("serial" in navigator)) {
        alert("Web Serial is not supported in this browser.");
        return;
      }

      serialPort = await navigator.serial.requestPort();

      showPanel("checking");

      transport = new Transport(serialPort, false);

      esploader = new ESPLoader({
        transport,
        baudrate: 921600,
        romBaudrate: 115200,
        terminal,
        debugLogging: false,
      });

      const chipName = await esploader.main();

      setStatus("connected");

      console.log(`Connected to chip: ${chipName}`);
      logMsg(`Connected to: ${chipName}`);

      setTimeout(() => {
        checkFirmwareVersion();
      }, 1);
    } catch (error) {
      console.error("Connection failed", error);
      serialPort = null;
      esploader = null;
      setStatus("disconnected");
      alert(
        "Failed to connect to device. Make sure it's plugged in and no other program is using the port.",
      );
      showPanel("connect");
    }
  }

  function checkFirmwareVersion() {
    //currentVersionLabel.innerText = "v1.0.4";

    setTimeout(() => {
      showPanel("updateAction");
    }, 1000);
  }

  async function handleStartUpdate() {
    showPanel("progress");
    setStatus("updating");
    logMsg("Starting esptool session...");
    logMsg("Connecting to ESP32-P4...");

    const options = await buildFlashOptions((fileIndex, written, total) => {
      const percent = total > 0 ? (written / total) * 100 : 0;
      updateProgressUI(percent);
      prgTxt.innerText = `Writing image ${fileIndex + 1}...`;
    });

    await esploader.writeFlash(options); // flash firmware

    logMsg("Hard resetting via RTS pin...");
    if (transport) {
      await transport.setDTR(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await transport.setDTR(true);
    }
    logMsg("Update complete.");
    prgTxt.innerText = "Finishing up...";

    setTimeout(() => {
      showPanel("success");
      setStatus("connected");
    }, 1000);
  }

  function updateProgressUI(percentage) {
    const wholePercentage = Math.floor(percentage);
    bar.style.width = `${wholePercentage}%`;
    pct.innerText = `${wholePercentage}%`;
  }

  async function resetUI() {
    if (transport) {
      await transport.disconnect().catch(() => {});
      console.log("Closing transport...");
    }
    if (serialPort) {
      await serialPort.close().catch(() => {});
      console.log("Closing serial port...");
    }
    serialPort = null;
    esploader = null;
    transport = null;
    setStatus("disconnected");
    bar.style.width = "0%";
    pct.innerText = "0%";
    termLog.innerHTML = "";
    prgTxt.innerText = "Preparing...";
    showPanel("connect");
  }

  btnConnect.addEventListener("click", handleConnect);
  btnStartUpdate.addEventListener("click", handleStartUpdate);
  btnDone.addEventListener("click", resetUI);

  showPanel("connect");
  setStatus("disconnected");
});
