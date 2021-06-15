## connection-tester

Test WebRTC connection formation between nodes.

Simple run:
```
npm ci
node index.js my-name
```

If you need more debug information you can run:
```
LOG_LEVEL=trace node index.js my-name
```

Change hostname and port (e.g. when running multiples):
```
node index.js my-name 0.0.0.0 6666
```

