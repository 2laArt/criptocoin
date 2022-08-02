


const tickersHandlers = new Map();
const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
const specialCouples = {};
let btc = null
ws.addEventListener('message', (e) => {
	const data = JSON.parse(e.data)

	let productId = null
	if (data.product_id) {
		productId = data.product_id.split("-")[0]
	}
	// if (specialCouples) { }
	if (data.type === "error" && data.message === "Failed to subscribe") {
		const [first, second] = data.reason.split(" ")[0].split("-");
		if (specialCouples.hasOwnProperty(first) && second == "USD") {
			const handler = tickersHandlers.get(first) ?? [];
			handler.forEach(fn => fn("N/A"));
			return;
		}
		subscribeMessage(first, "USD")
		specialCouples[first] = null;
		console.log("error")
	}
	if (data.type === "ticker" && productId) {
		if (
			specialCouples.hasOwnProperty(productId) && productId !== "BTC"
		) {
			specialCouples[productId] = data?.price;
			if (
				typeof +specialCouples[productId] === "number" &&
				typeof +btc === "number"
			) {

				let s = (specialCouples[productId] / btc).toFixed(10);
				if (s.length > 10) {
					const handler = tickersHandlers.get(productId) ?? [];
					handler.forEach(fn => fn([...s].splice(0, 10).join("")))
					return;
				} else {
					const handler = tickersHandlers.get(productId) ?? [];
					handler.forEach(fn => fn(s))
				}
			}
		}

		if (!specialCouples.hasOwnProperty(productId)) {
			const newPrice = data?.price
			const handler = tickersHandlers.get(productId) ?? [];
			handler.forEach(fn => fn(newPrice))
		}


		if (data?.product_id === "BTC-USD") {
			btc = data?.price
		}
	}
})
subscribeMessage("BTC", "USD")
// send
function sendMessageToWs(message) {
	const msg = JSON.stringify(message)
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(msg)
	}
	ws.addEventListener('open', () => {
		ws.send(msg)
	}, { once: true })
}
// sub----unsub
function subscribeMessage(ticker, secCoin = 'BTC') {
	let msg = {
		"type": "subscribe",
		"product_ids": [
			`${ticker}-${secCoin}`
		],
		"channels": [
			"ticker",
		],
	}

	sendMessageToWs(msg)
}
function unsubscribeMessage(ticker, secCoin = 'BTC') {
	let msg = {
		"type": "unsubscribe",
		"product_ids": [
			`${ticker}-${secCoin}`
		],
		"channels": [
			"ticker",
		]
	}
	sendMessageToWs(msg)
}

export const subscribeToUpdata = (tickerName, callBack) => {
	const subscribe = tickersHandlers.get(tickerName) ?? [];
	tickersHandlers.set(tickerName, [...subscribe, callBack]);
	subscribeMessage(tickerName)
}
export const unsubscribeToUpdata = (tickerName) => {
	tickersHandlers.delete(tickerName)
	unsubscribeMessage(tickerName)
}
// sub----unsub

window.tickers = tickersHandlers

