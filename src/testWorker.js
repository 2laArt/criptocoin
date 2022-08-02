

onconnect = function (e) {
	const port = e.ports[0];

	port.addEventListener('message', function (e) {
		const workerResult = `Result:`;
		port.postMessage(workerResult);
	});

	port.start(); // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
}