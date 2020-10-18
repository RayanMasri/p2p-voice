var socket = io('http://localhost:4000/');
var peer = new Peer({
    host: location.hostname,
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
    path: '/peerjs',
});

var connect = (id) => {
    var connection = peer.connect(id);
    connection.on('open', function () {
        const context = new AudioContext();
        // Receive messages
        connection.on('data', function (data) {
            let blob = window.atob(data);
            let fLen = blob.length / Float32Array.BYTES_PER_ELEMENT;
            let dView = new DataView(
                new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)
            );
            let fAry = new Float32Array(fLen);
            let p = 0;

            for (var j = 0; j < fLen; j++) {
                p = j * 4;
                dView.setUint8(0, blob.charCodeAt(p));
                dView.setUint8(1, blob.charCodeAt(p + 1));
                dView.setUint8(2, blob.charCodeAt(p + 2));
                dView.setUint8(3, blob.charCodeAt(p + 3));
                fAry[j] = dView.getFloat32(0, true);
            }

            let buffer = new AudioBuffer({
                numberOfChannels: 1,
                length: context.sampleRate * 2.0,
                sampleRate: context.sampleRate,
            });

            buffer.getChannelData(0).set(fAry);

            let sound = context.createBufferSource();
            sound.buffer = buffer;
            sound.connect(context.destination);
            sound.start(context.currentTime);
        });

        // Send messages
        navigator.getUserMedia({ audio: true, video: false }, (stream) => {
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(2048, 1, 1);

            source.connect(processor);
            processor.connect(context.destination);

            processor.onaudioprocess = (e) => {
                let chunk = btoa(
                    String.fromCharCode.apply(
                        null,
                        new Uint8Array(e.inputBuffer.getChannelData(0).buffer)
                    )
                );

                connection.send(chunk);
            };
        });
    });
};

peer.on('open', (id) => {
    console.log(`joined as ${id}`);
});

// use this homie FUCKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK
// peer.on('connection', (connection) => {
//     connection.on('open', function () {
//         // Receive messages
//         connection.on('data', function (data) {
//             console.log('Received', data);
//         });

//         // Send messages
//         connection.send('Hello!');
//     });
// });
peer.on('connection', (connection) => {
    // Receive messages
    connection.on('data', function (data) {
        let blob = window.atob(data);
        let fLen = blob.length / Float32Array.BYTES_PER_ELEMENT;
        let dView = new DataView(
            new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT)
        );
        let fAry = new Float32Array(fLen);
        let p = 0;

        for (var j = 0; j < fLen; j++) {
            p = j * 4;
            dView.setUint8(0, blob.charCodeAt(p));
            dView.setUint8(1, blob.charCodeAt(p + 1));
            dView.setUint8(2, blob.charCodeAt(p + 2));
            dView.setUint8(3, blob.charCodeAt(p + 3));
            fAry[j] = dView.getFloat32(0, true);
        }

        let buffer = new AudioBuffer({
            numberOfChannels: 1,
            length: context.sampleRate * 2.0,
            sampleRate: context.sampleRate,
        });

        buffer.getChannelData(0).set(fAry);

        let sound = context.createBufferSource();
        sound.buffer = buffer;
        sound.connect(context.destination);
        sound.start(context.currentTime);
    });

    // Send messages
    navigator.getUserMedia({ audio: true, video: false }, (stream) => {
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(4096, 1, 1);

        source.connect(processor);
        processor.connect(context.destination);

        processor.onaudioprocess = (e) => {
            let chunk = btoa(
                String.fromCharCode.apply(
                    null,
                    new Uint8Array(e.inputBuffer.getChannelData(0).buffer)
                )
            );

            connection.send(chunk);
        };
    });
});

// peer.on('call', (call) => {
//     navigator.getUserMedia({ audio: true, video: false }, (stream) => {
//         call.answer(stream);
//     });

//     call.on('stream', (stream) => {
//         console.log(`caught stream from ${call.peer}`);
//         const context = new AudioContext();
//         const source = context.createMediaStreamSource(stream);
//         const processor = context.createScriptProcessor(2048, 1, 1);

//         source.connect(processor);
//         processor.connect(context.destination);

//         processor.onaudioprocess = (e) => {
//             console.log(
//                 btoa(
//                     String.fromCharCode.apply(
//                         null,
//                         new Uint8Array(e.inputBuffer.getChannelData(0).buffer)
//                     )
//                 )
//             );
//             let sound = context.createBufferSource();
//             sound.buffer = e.inputBuffer;
//             sound.connect(context.destination);
//             sound.start(context.currentTime);
//         };
//     });
// });

socket.on('info', (clients) => {
    clients.map((client, index) => {
        if (client == peer.id) {
            clients[index] = {
                text: `<strong>${client}</strong>`,
                id: client,
            };
            return;
        }
        clients[index] = {
            text: client,
            id: client,
        };
    });

    $('ul').empty();
    for (const client of clients) {
        $('ul').append(
            $(`<button>${client.text}</button>`).click(function () {
                connect(client.id);
            })
        );
    }
});
