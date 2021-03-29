let ws;
let state = "Loading";
let enabled = false;
let stateSuccess = false;

// Extension messages
const GET_STATE_MESSAGE = "getState";
const STATE_MESSAGE = "state";

// Pomotroid messages
const GET_CURRENT_STATE = "get-current-state";
const ROUND_CHANGE = "round-change";
const GET_BLACKLIST_SITES = "get-blacklist-sites";
const BLACKLIST_SITES = "blacklist-sites";

let blacklistSites = [];

const handlePopupMessage = (msg) => {
  switch (msg.action) {
    case GET_STATE_MESSAGE:
      handleGetStateMessage();

      break;
    default:
  }
};

const handlePomotroidMessage = (message) => {
  const parsedMessage = JSON.parse(message.data);

  switch (parsedMessage.event) {
    case ROUND_CHANGE:
      handleRoundChange(parsedMessage.data);

      break;
    case BLACKLIST_SITES:
      handleBlacklistSites(parsedMessage.data);
    default:
  }
};

const connectToPomotroid = () => {
  try {
    ws = new WebSocket("ws://localhost:8080");

    ws.onopen = (_) => {
      clearInterval(connectInterval);
      state = "Blocker Not Active";
      stateSuccess = false;
      handleGetStateMessage();

      ws.send(GET_BLACKLIST_SITES);
      ws.send(GET_CURRENT_STATE);
    };

    ws.onmessage = (message) => {
      handlePomotroidMessage(message);
    };

    ws.onclose = (_) => {
      state = "Disconnected";
      stateSuccess = false;
      connectInterval();

      handleGetStateMessage();
    };

    ws.onerror = ws.onclose;
  } catch (_) {
    state = "Disconnected";
    stateSuccess = false;
  }
};

const handleGetStateMessage = () => {
  const message = {
    action: STATE_MESSAGE,
    data: {
      state,
      success: stateSuccess,
    },
  };

  chrome.runtime.sendMessage(message);
};

const handleRoundChange = (data) => {
  const round = data.state;

  if (round === "work") {
    enabled = true;
    state = "Blocker Active";
    stateSuccess = true;
  } else {
    enabled = false;
    state = "Blocker Not Active";
    stateSuccess = false;
  }

  handleGetStateMessage();
};

const handleBlacklistSites = (data) => {
  blacklistSites = data;
};

const connectInterval = setInterval(() => {
  connectToPomotroid();
}, 2000);

chrome.runtime.onMessage.addListener(handlePopupMessage);

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (
    enabled &&
    !!blacklistSites.filter((site) => tab.url.includes(site) && site.length > 3)
      .length
  ) {
    chrome.tabs.update(tabId, { url: "https://google.com/do-your-work" });
  }
});
