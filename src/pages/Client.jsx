import { useRef } from "react";
import { io } from "socket.io-client";

export const Client = () => {
    document.title = "client";
    let peerConnection;
    const config = {
        iceServers: [
            {
                urls: ["stun:stun.l.google.com:19302"]
            }
        ]
    };
    const videoRef = useRef(null);

    // const socket = io.connect(window.location.origin)
    const socket = io("http://localhost:4000/", {
        autoConnect: false,
    });

    socket.connect();

    socket.on("offer", (id, description) => {
        
        peerConnection = new RTCPeerConnection(config);
        peerConnection
            .setRemoteDescription(description)
            .then(() => peerConnection.createAnswer())
            .then(sdp => peerConnection.setLocalDescription(sdp))
            .then(() => {
                socket.emit("answer", id, peerConnection.localDescription);
            });
        peerConnection.ontrack = event => {
            videoRef.current.srcObject = event.streams[0];
        };
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit("candidate", id, event.candidate);
            }
        };
    });

    socket.on("candidate", (id, candidate) => {
        peerConnection
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error(e));
    });

    socket.on("connect", () => {
        socket.emit("watcher");
    });

    socket.on("broadcaster", () => {
        socket.emit("watcher");
    });

    window.onunload = window.onbeforeunload = () => {
        socket.close();
        peerConnection.close();
    };

    return <section className="client">
        <header>
            <h1>Client</h1>
        </header>
        <main>
            <video ref={videoRef} autoPlay={true}></video>
            <button onClick={() => videoRef.current.play()}>Start</button>
        </main>

    </section>;
}