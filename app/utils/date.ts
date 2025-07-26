export function formatDateNoSeconds(dateString: string) {
	const date = new Date(dateString);
	return date
		.toLocaleString("en-GB", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true, // or false for 24h
		})
		.replace(",", " at")
		.replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
}
