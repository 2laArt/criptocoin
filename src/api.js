
export async function getFullListCoins(arr) {
	const f = await fetch('https://api.pro.coinbase.com/currencies').then(e => e.json());
	f.filter(i => i.details.type === 'crypto').forEach(i => arr.push(i.id))
}

const tickersHandlers = new Map();
const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
const specialCouples = { k: 1 };
let btc = null
ws.addEventListener('message', (e) => {
	const data = JSON.parse(e.data)

	// if (specialCouples) { }
	if (data.type === "error" && data.message === "Failed to subscribe") {
		const [first, second] = data.reason.split(" ")[0].split("-");
		const handler = tickersHandlers.get(first) ?? [];
		handler.forEach(fn => fn("N/A"));
		subscribeMessage("BTC", "USD")
		subscribeMessage(first, "USD")
		specialCouples[first] = null;
	}
	if (data.type === "l2update") {
		if (
			specialCouples.hasOwnProperty(data.product_id.split("-")[0] &&
				data.product_id.split("-")[0] !== "BTC")
		) {
			specialCouples[data.product_id.split("-")[0]] = data?.changes[0][1];
			if (
				typeof +specialCouples[data.product_id.split("-")[0]] === "number" &&
				typeof +btc === "number"
			) {
				let s = specialCouples[data.product_id.split("-")[0]] / btc;
				const handler = tickersHandlers.get(data?.product_id.split("-")[0]) ?? [];
				handler.forEach(fn => fn(s.toPrecision(4)))
			}
		}

		if (!specialCouples.hasOwnProperty(data.product_id.split("-")[0])) {
			const newPrice = data?.changes[0][1]
			const handler = tickersHandlers.get(data?.product_id.split("-")[0]) ?? [];
			handler.forEach(fn => fn(newPrice))
		}


		if (data?.product_id === "BTC-USD") {
			btc = data.changes[0][1]
		}
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
			"level2",
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
			"level2",
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