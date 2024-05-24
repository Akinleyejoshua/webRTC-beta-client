import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const BroadCast = () => {
    document.title = "Broadcast";
    const videoRef = useRef(null);
    const [id, setId] = useState("");

    const peerConnections = {};
    const config = {
        iceServers: [
            {
                urls: ["stun:stun.l.google.com:19302"]
            }
        ]
    };

    const socket = io("http://localhost:4000/", {
        autoConnect: false,
    });

    socket.connect();

    // Media contrains
    const constraints = {
        video: true,
        // Uncomment to enable audio
        audio: true,
    };

    const start = () => {
        navigator.mediaDevices
            .getDisplayMedia(constraints)
            .then(stream => {
                videoRef.current.srcObject = stream;
                window.stream = stream;
                socket.emit("broadcaster");
            })
            .catch(error => console.error(error));
    }

    useEffect(() => {

        socket.on("watcher", id => {
            const peerConnection = new RTCPeerConnection(config);
            peerConnections[id] = peerConnection;
            setId(id)
    
            let stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit("candidate", id, event.candidate);
                }
            };
    
            peerConnection
                .createOffer()
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    socket.emit("offer", id, peerConnection.localDescription);
                });
        });
    
        socket.on("answer", (id, description) => {
            peerConnections[id].setRemoteDescription(description);
        });
    
        socket.on("candidate", (id, candidate) => {
            peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
        });
    
        socket.on("disconnectPeer", id => {
            peerConnections[id].close();
            delete peerConnections[id];
        });
    
    }, [])

   
    window.onunload = window.onbeforeunload = () => {
        socket.close();
    };


    return <section className="broadcast">
        <header>
            <h1>Broadcast - {id}</h1>
        </header>
        <main>
            <div className="video">
                <video ref={videoRef} autoPlay={true}></video>
                <div className="overlay"></div>
            </div>
            <button onClick={start}>Start</button>
        </main>

    </section>;
}