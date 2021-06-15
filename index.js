const { startNetworkNode, Protocol } = require('streamr-network')
const { StreamMessage, MessageIDStrict, MessageRef } = Protocol

const TRACKER_URL = 'ws://95.216.64.56:30300'
const PUBLISH_INTERVAL = 10 * 1000
const REPORT_NEIGHBORS_INTERVAL = 30 * 1000
const LOG_OWN_MESSAGES = false

// Parse 1st argument as node id
const args = process.argv.slice(2)
if (args.length < 0 || args.length > 2) {
    console.error('Args: node index.js <name> [port]')
    process.exit(1)
}
const name = args[0];
const port = args[1] || 7000;

(async() => {
    const networkNode = await startNetworkNode({
        host: '127.0.0.1',
        port,
        trackers: [TRACKER_URL],
        id: name
    })
    networkNode.on('streamr:node:node-connected', (nodeId) => {
        console.info(`node ${nodeId} connected`)
    })
    networkNode.on('streamr:node:node-disconnected', (nodeId) => {
        console.info(`node ${nodeId} disconnected`)
    })
    networkNode.addMessageListener((msg) => {
        const content = msg.getContent(true)
        if (LOG_OWN_MESSAGES || content.publishedBy !== name) {
            console.info(`received ${JSON.stringify(content)}`);
        }
    })
    networkNode.subscribe('test-stream', 0)
    networkNode.start()

    // Publish every `PUBLISH_INTERVAL` ms
    let publishCounter = 0
    let prevMsgRef = null
    setInterval(() => {
        const ts = Date.now()
        networkNode.publish(new StreamMessage({
            messageId: new MessageIDStrict('test-stream', 0, ts, 0, name, 'sessionId'),
            prevMsgRef,
            content: {
                messageNo: publishCounter++,
                publishedBy: name
            },
            messageType: Protocol.StreamMessage.MESSAGE_TYPES.MESSAGE,
            contentType: Protocol.StreamMessage.CONTENT_TYPES.JSON,
            encryptionType: Protocol.StreamMessage.ENCRYPTION_TYPES.NONE
        }))
        prevMsgRef = new MessageRef(ts, 0)
    }, PUBLISH_INTERVAL)

    // Report neighbors every `REPORT_NEIGHBORS_INTERVAL` ms
    setInterval(() => {
        const neighbors = [...networkNode.getNeighbors()].sort()
        console.info(`current neighbors: ${JSON.stringify(neighbors)}`)
    }, REPORT_NEIGHBORS_INTERVAL)
})()
