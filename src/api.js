

const tickersHandlers = new Map();
const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
ws.addEventListener('message', (e) => {
	const data = JSON.parse(e.data);
	let productId = null
	if (data.product_id) {
		productId = data.product_id.split("-")[0]
	}
	if (data.type === "ticker" && productId) {
		const newPrice = data?.price
		const handler = tickersHandlers.get(productId) ?? [];
		handler.forEach(fn => fn(newPrice))
	}
})

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
function subscribeMessage(ticker, secCoin = 'USD') {
	let msg = {
		"type": "subscribe",
		"product_ids": [
			`${ticker}-${secCoin}`
		],
		"channels": [
			"ticker",
		]
	}

	sendMessageToWs(msg)
}
function unsubscribeMessage(ticker, secCoin = 'USD') {
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

const bc = new BroadcastChannel('test_channel');
bc.postMessage("hhhh")