var connection = new RTCPeerConnection();

var send_channel = connection.createDataChannel("sendChannel");
send_channel.onopen = () => console.log("send_channel.onopen");
send_channel.onclose = () => console.log("send_channel.onclose");

var receive_channel;
connection.ondatachannel = function(event) {
    console.log("connection.ondatachannel");
    receive_channel = event.channel;
    //receive_channel.onmessage = event => console.log("receive_channel.onmessage - " + event.data);
    receive_channel.onmessage = function(event) {
        document.getElementById("o-received").value = event.data;
    }
    receive_channel.onopen = () => console.log("receive_channel.onopen");
    receive_channel.onclose = () => console.log("receive_channel.onclose");
}

// Ice candidates handler stores the candidate in the UI
// so that the user can register it with another peer.
connection.onicecandidate = function(event) {
    if (!event.candidate)
        return;
    document.getElementById("o-ice").value = JSON.stringify(event.candidate);
}

// Click to generate an offer.
document.getElementById("b-generate-offer").addEventListener("click", function() {
    connection.createOffer()
        .then(offer => connection.setLocalDescription(offer))
        .then(function() {
            document.getElementById("o-offer").value = JSON.stringify(connection.localDescription);
        })
        .catch(error => console.log(error));
}, false);

// Accept the offer.
document.getElementById("b-accept-offer").addEventListener("click", function() {
    var offer = new RTCSessionDescription(JSON.parse(document.getElementById("i-offer").value));
    connection.setRemoteDescription(offer)
        .then(() => connection.createAnswer())
        .then(function(answer) {
            return connection.setLocalDescription(answer);
        })
        .then(function() {
            document.getElementById("o-answer").value = JSON.stringify(connection.localDescription);
        }).catch(error => console.log(error));
}, false);

// Accept the answer.
document.getElementById("b-accept-answer").addEventListener("click", function() {
    var answer = new RTCSessionDescription(JSON.parse(document.getElementById("i-answer").value));
    connection.setRemoteDescription(answer);
}, false);

// Click to accept the ice candidate.
document.getElementById("b-accept-ice").addEventListener("click", function() {
    var ice = new RTCIceCandidate(JSON.parse(document.getElementById("i-ice").value));
    connection.addIceCandidate(ice);
}, false);

// Click to send.
document.getElementById("b-send").addEventListener("click", function() {
    var message = document.getElementById("i-send").value;
    send_channel.send(message);
}, false);
