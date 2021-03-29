const GET_STATE_MESSAGE = "getState";
const STATE_MESSAGE = "state";

const handleBackgroundMessage = (msg) => {
  switch (msg.action) {
    case STATE_MESSAGE:
      console.log(2);
      handleStateMessage(msg.data);

      break;
    default:
  }
};

const updateStatus = (status, success) => {
  $("#status").text(`Status: ${status}`);
  if (success) {
    $("#status").addClass("statusTxtSuccess");
    $("#status").removeClass("statusTxtFailure");
  } else {
    $("#status").addClass("statusTxtFailure");
    $("#status").removeClass("statusTxtSuccess");
  }
};

const handleStateMessage = (data) => {
  updateStatus(data.state, data.success);
};

const getState = () => {
  const message = {
    action: "getState",
  };

  chrome.runtime.sendMessage(message);
};

chrome.runtime.onMessage.addListener(handleBackgroundMessage);
getState();
