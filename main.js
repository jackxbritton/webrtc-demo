var connection = new RTCPeerConnection();

var send_channel = connection.createDataChannel("sendChannel");
send_channel.onopen = () => console.log("send_channel.onopen");
send_channel.onclose = () => console.log("send_channel.onclose");

var receive_channel;
connection.ondatachannel = function(event) {
    console.log("connection.ondatachannel");
    receive_channel = event.channel;
    receive_channel.onmessage = event => console.log("receive_channel.onmessage - " + event.data);
    receive_channel.onopen = () => console.log("receive_channel.onopen");
    receive_channel.onclose = () => console.log("receive_channel.onclose");
}

// TODO What happens?
//      1) Connections and send channels are initialized.
//      2) A connection offer is made.
//          a) setLocalDescription and setRemoteDescription
//          b) 

// UI.
var button_offer = document.getElementById("offer");
var textbox_offer = document.getElementById("offer-text");
var accept_offer = document.getElementById("accept-offer");
var textbox_answer = document.getElementById("answer-text");
var accept_answer = document.getElementById("accept-answer");
var ice_candidate_text = document.getElementById("ice-candidate-text");
var accept_ice = document.getElementById("accept-ice");

// Ice candidates handler stores the candidate in the UI
// so that the user can register it with another peer.
connection.onicecandidate = function(event) {
    if (!event.candidate)
        return;
    ice_candidate_text.value = JSON.stringify(event.candidate);
}

// Click to generate an offer.
button_offer.addEventListener("click", function() {
    connection.createOffer()
        .then(offer => connection.setLocalDescription(offer))
        .then(function() {
            //textbox_offer.value = JSON.stringify(connection.localDescription);
            textbox_offer.value = JSON.stringify(connection.localDescription);
        })
        .catch(error => console.log(error));
}, false);

// Accept the offer.
accept_offer.addEventListener("click", function() {
    var offer = new RTCSessionDescription(JSON.parse(textbox_offer.value));
    connection.setRemoteDescription(offer)
        .then(() => connection.createAnswer())
        .then(function(answer) {
            console.log(answer);
            return connection.setLocalDescription(answer);
        })
        .then(function() {
            textbox_answer.value = JSON.stringify(connection.localDescription);
        }).catch(error => console.log(error));
}, false);

// Accept the answer.
accept_answer.addEventListener("click", function() {
    var answer = new RTCSessionDescription(JSON.parse(textbox_answer.value));
    connection.setRemoteDescription(answer);
}, false);

// Click to accept the ice candidate.
accept_ice.addEventListener("click", function() {
    var ice = new RTCIceCandidate(JSON.parse(ice_candidate_text.value));
    connection.addIceCandidate(ice);
}, false);
