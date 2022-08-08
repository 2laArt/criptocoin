
export async function getFullListCoins(arr) {
	const f = await fetch('https://api.pro.coinbase.com/currencies').then(e => e.json());
	f.filter(i => i.details.type === 'crypto').forEach(i => arr.push(i.id))
}