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
        $("#o-received").val(event.data);
    }
    receive_channel.onopen = () => console.log("receive_channel.onopen");
    receive_channel.onclose = () => console.log("receive_channel.onclose");
}

// Ice candidates handler stores the candidate in the UI
// so that the user can register it with another peer.
connection.onicecandidate = function(event) {
    if (!event.candidate)
        return;
    // JSON-encode event.candidate and add to list.
    var json = JSON.stringify(event.candidate);
    var element = $("<li class='list-group-item'>" + json + "</li>");
    $("#ice-candidates").append(element);
}

// Click to generate an offer.
$("#b-generate-offer").click(function() {
    connection.createOffer()
        .then(offer => connection.setLocalDescription(offer))
        .then(function() {
            $("#o-offer").val(JSON.stringify(connection.localDescription));
        })
        .catch(error => console.log(error));
});

// Accept the offer.
$("#b-accept-offer").click(function() {
    var offer = new RTCSessionDescription(JSON.parse($("#i-offer").val()));
    connection.setRemoteDescription(offer)
        .then(() => connection.createAnswer())
        .then(function(answer) {
            return connection.setLocalDescription(answer);
        })
        .then(function() {
            $("#o-answer").val(JSON.stringify(connection.localDescription));
        }).catch(error => console.log(error));
});

// Accept the answer.
$("#b-accept-answer").click(function() {
    var answer = new RTCSessionDescription(JSON.parse($("#i-answer").val()));
    connection.setRemoteDescription(answer);
});

// Click to accept the ice candidate.
$("#b-accept-ice").click(function() {
    var ice = new RTCIceCandidate(JSON.parse($("#i-ice").val()));
    connection.addIceCandidate(ice);
});

// Click to send.
$("#b-send").click(function() {
    var message = $("#i-send").val();
    send_channel.send(message);
});
